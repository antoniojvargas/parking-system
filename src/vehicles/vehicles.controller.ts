import {
  Controller,
  Post,
  Body,
  Get,
  UseInterceptors,
  Param,
} from '@nestjs/common';
import { CacheInterceptor, CacheKey } from '@nestjs/cache-manager';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehiclesService.registerEntry(createVehicleDto);
  }

  @UseInterceptors(CacheInterceptor)
  @CacheKey('vehicles_list')
  @Get()
  findAll() {
    return this.vehiclesService.findAllParked();
  }

  @Post(':id/exit')
  exit(@Param('id') id: string) {
    return this.vehiclesService.registerExit(id);
  }
}
