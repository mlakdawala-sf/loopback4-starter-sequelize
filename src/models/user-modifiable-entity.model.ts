import {Column} from 'sequelize-typescript';
import {BaseEntity} from './base-entity.model';

export class UserModifiableEntity extends BaseEntity {
  @Column({field: 'created_by'})
  createdBy?: number;

  @Column({field: 'modified_by'})
  modifiedBy?: number;
}
