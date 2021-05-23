import {Column, DataType, Model, Table} from 'sequelize-typescript';

@Table({
  tableName: 'audit_logs',
  schema: 'logs',
  timestamps: false,
})
export class AuditLog extends Model {
  @Column({
    primaryKey: true,
    autoIncrement: true,
  })
  id?: number;

  @Column({
    field: 'operation_name',
  })
  operationName: string;

  @Column({
    type: DataType.DATE,
    field: 'operation_time',
  })
  operationTime: Date;

  @Column({
    field: 'table_name',
  })
  tableName: string;

  @Column({
    field: 'log_type',
  })
  logType?: string;

  @Column({
    field: 'entity_id',
  })
  entityId?: string;

  @Column({
    field: 'user_id',
  })
  userId?: string;

  @Column({
    type: DataType.JSONB,
  })
  before?: object;

  @Column({
    type: DataType.JSONB,
  })
  after?: object;

  constructor(data?: Partial<AuditLog>) {
    super(data);
  }
}
