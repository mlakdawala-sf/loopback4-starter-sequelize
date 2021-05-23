import {Getter} from '@loopback/core';
import {Model, ModelCtor} from 'sequelize-typescript';
import {AuthUser} from '../models/auth-user.model';
import {SoftDeleteEntity} from '../models/soft-delete.model';
import {SoftCrudRepository} from './soft-crud.repository.base';

export abstract class DefaultSoftCrudRepository<
  T extends SoftDeleteEntity
> extends SoftCrudRepository<T> {
  constructor(
    protected entity: ModelCtor<Model<any, any>>,
    protected readonly getCurrentUser: Getter<AuthUser>,
  ) {
    super(entity, getCurrentUser);
  }
}
