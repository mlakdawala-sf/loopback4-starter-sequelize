import {Column, DataType, Model} from 'sequelize-typescript';

export class SoftDeleteEntity extends Model {
  @Column({
    defaultValue: false,
  })
  deleted?: boolean;

  @Column({type: DataType.DATE, allowNull: true, field: 'deleted_on'})
  deletedOn?: Date;

  @Column({allowNull: true, field: 'deleted_by'})
  deletedBy?: number;
}
