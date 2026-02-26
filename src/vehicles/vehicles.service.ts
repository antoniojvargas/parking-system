import {
  Injectable,
  Inject,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Attributes } from 'sequelize';
import { Vehicle } from './models/vehicle.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectModel(Vehicle)
    private vehicleModel: typeof Vehicle,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAllParked(): Promise<Vehicle[]> {
    console.log('Consultando a la Base de Datos PostgreSQL...');
    return this.vehicleModel.findAll({
      where: { status: 'parked' },
      order: [['entryTime', 'DESC']],
    });
  }

  async registerEntry(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    // 1. Verificar si el vehículo ya está en el parqueo (status: parked)
    const alreadyParked = await this.vehicleModel.findOne({
      where: { plate: createVehicleDto.plate, status: 'parked' },
    });

    if (alreadyParked) {
      throw new BadRequestException(
        'Este vehículo ya se encuentra en el estacionamiento',
      );
    }

    // 2. Crear el registro con la hora de entrada actual
    return this.vehicleModel.create({
      plate: createVehicleDto.plate,
      type: createVehicleDto.type,
      entryTime: new Date(),
      status: 'parked',
    } as Attributes<Vehicle>);
  }

  async registerExit(id: string) {
    const vehicle = await this.vehicleModel.findByPk(id);

    if (!vehicle) {
      throw new NotFoundException('Vehículo no encontrado');
    }

    const entryTimeRaw = vehicle.getDataValue('entryTime');
    const statusRaw = vehicle.getDataValue('status');
    const plateRaw = vehicle.getDataValue('plate');

    if (statusRaw === 'exited') {
      throw new BadRequestException('El vehículo ya registró su salida');
    }

    if (!entryTimeRaw) {
      throw new InternalServerErrorException(
        'Error en los datos: El vehículo no tiene hora de entrada registrada',
      );
    }

    const exitTime = new Date();
    const entryTime = new Date(entryTimeRaw);

    const diffInMs = exitTime.getTime() - entryTime.getTime();
    const diffInHours = Math.max(1, Math.ceil(diffInMs / (1000 * 60 * 60)));
    const totalCost = diffInHours * 2;

    await vehicle.update({
      exitTime,
      status: 'exited',
    });

    await this.cacheManager.del('vehicles_list');

    return {
      message: 'Salida registrada con éxito',
      plate: plateRaw,
      entry: entryTime.toISOString(),
      exit: exitTime.toISOString(),
      totalHours: diffInHours,
      totalCost: `$${totalCost}`,
    };
  }
}
