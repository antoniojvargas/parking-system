import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Vehicle } from './models/vehicle.entity';

@Module({
  imports: [SequelizeModule.forFeature([Vehicle])],
  exports: [SequelizeModule],
})
export class VehiclesModule {}
