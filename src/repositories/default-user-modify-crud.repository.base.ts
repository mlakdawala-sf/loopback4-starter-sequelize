import {inject} from '@loopback/core';
import {Getter} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {AuthenticationBindings} from 'loopback4-authentication';
import {UpdateOptions} from 'sequelize';
import {Model, ModelCtor} from 'sequelize-typescript';
import {AuthErrorKeys} from '../enums/auth-error-keys.enum';
import {UserModifiableEntity} from '../models';
import {AuthUser} from '../models/auth-user.model';
import {SoftCrudRepository} from './soft-crud.repository.base';

export abstract class DefaultUserModifyCrudRepository<
  T extends UserModifiableEntity
> extends SoftCrudRepository<T> {
  constructor(
    protected entity: ModelCtor<Model<any, any>>,
    @inject.getter(AuthenticationBindings.CURRENT_USER)
    protected readonly getCurrentUser: Getter<AuthUser>,
  ) {
    super(entity, getCurrentUser);
  }

  async create(entity: Partial<T>): Promise<T> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) {
      throw new HttpErrors.Forbidden(AuthErrorKeys.InvalidCredentials);
    }
    entity.createdBy = currentUser.id;
    entity.modifiedBy = currentUser.id;
    return super.create(entity);
  }

  // async createAll(entities: T[]): Promise<T[]> {
  //   const currentUser = await this.getCurrentUser();
  //   if (!currentUser) {
  //     throw new HttpErrors.Forbidden(AuthErrorKeys.InvalidCredentials);
  //   }
  //   entities.forEach(entity => {
  //     entity.createdBy = currentUser ? currentUser.id : undefined;
  //     entity.modifiedBy = currentUser ? currentUser.id : undefined;
  //   });
  //   return super.createAll(entities);
  // }

  async save(entity: T): Promise<T> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) {
      throw new HttpErrors.Forbidden(AuthErrorKeys.InvalidCredentials);
    }
    entity.modifiedBy = currentUser.id;
    return super.create(entity);
  }

  async update(entity: T, where?: UpdateOptions) {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) {
      throw new HttpErrors.Forbidden(AuthErrorKeys.InvalidCredentials);
    }
    entity.modifiedBy = currentUser.id;
    return super.update(entity, where);
  }

  // async updateAll(data: T, where?: Where<T>) {
  //   const currentUser = await this.getCurrentUser();
  //   if (!currentUser) {
  //     throw new HttpErrors.Forbidden(AuthErrorKeys.InvalidCredentials);
  //   }
  //   data.modifiedBy = currentUser.id;
  //   return super.updateAll(data, where);
  // }

  async updateById(id: any, data: T) {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) {
      throw new HttpErrors.Forbidden(AuthErrorKeys.InvalidCredentials);
    }
    data.modifiedBy = currentUser.id;
    return super.update(data, {where: {id}});
  }
  // async replaceById(id: any, data: T) {
  //   const currentUser = await this.getCurrentUser();
  //   if (!currentUser) {
  //     throw new HttpErrors.Forbidden(AuthErrorKeys.InvalidCredentials);
  //   }
  //   data.modifiedBy = currentUser.id;
  //   return super.replaceById(id, data);
  // }
}
