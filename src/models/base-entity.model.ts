import {Column, CreatedAt, UpdatedAt} from 'sequelize-typescript';
import {SoftDeleteEntity} from './soft-delete.model';

export class BaseEntity extends SoftDeleteEntity {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    autoIncrementIdentity: true,
  })
  id?: number;

  @CreatedAt
  @Column({field: 'created_on'})
  createdOn?: Date;

  @UpdatedAt
  @Column({field: 'modified_on'})
  modifiedOn?: Date;
}
