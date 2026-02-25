import { Column, Model, Table, DataType } from 'sequelize-typescript';

@Table({ tableName: 'vehicles' })
export class Vehicle extends Model<Vehicle> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({ allowNull: false, unique: true })
  declare plate: string; // Placa del vehículo

  @Column({ allowNull: false })
  type: string; // 'car' o 'motorcycle'

  @Column({ defaultValue: 'parked' })
  status: string; // 'parked', 'calculating', 'exited'

  @Column({ type: DataType.DATE })
  entryTime: Date;

  @Column({ type: DataType.DATE })
  exitTime: Date;
}
