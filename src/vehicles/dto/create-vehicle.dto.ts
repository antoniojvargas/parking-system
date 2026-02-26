import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, Matches } from 'class-validator';

export enum VehicleType {
  CAR = 'car',
  MOTORCYCLE = 'motorcycle',
}

export class CreateVehicleDto {
  @ApiProperty({ example: 'ABC-123', description: 'Placa del vehículo' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z0-9-]{6,10}$/, { message: 'Placa inválida (ej: ABC-123)' })
  plate: string;

  @ApiProperty({
    example: 'car',
    enum: ['car', 'motorcycle'],
    description: 'Tipo de vehículo',
  })
  @IsEnum(VehicleType, { message: 'El tipo debe ser car o motorcycle' })
  type: VehicleType;
}
