import { IsEnum, IsNotEmpty, IsString, Matches } from 'class-validator';

export enum VehicleType {
  CAR = 'car',
  MOTORCYCLE = 'motorcycle',
}

export class CreateVehicleDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z0-9-]{6,10}$/, { message: 'Placa inválida (ej: ABC-123)' })
  plate: string;

  @IsEnum(VehicleType, { message: 'El tipo debe ser car o motorcycle' })
  type: VehicleType;
}
