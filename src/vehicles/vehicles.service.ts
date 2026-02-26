import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Attributes } from 'sequelize';
import { Vehicle } from './models/vehicle.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectModel(Vehicle)
    private vehicleModel: typeof Vehicle,
  ) {}

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
}
