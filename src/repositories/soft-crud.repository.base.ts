import {Getter} from '@loopback/core';
import {
  CountOptions,
  CountWithOptions,
  DestroyOptions,
  FindOptions,
  IncludeOptions,
  UpdateOptions,
  WhereOptions,
} from 'sequelize';
import {Model, ModelCtor} from 'sequelize-typescript';
import {AuthUser} from '../models/auth-user.model';
import {SoftDeleteEntity} from '../models/soft-delete.model';
import {DefaultCrudRepository} from './default-crud.repository';

export abstract class SoftCrudRepository<
  T extends SoftDeleteEntity
> extends DefaultCrudRepository<T> {
  constructor(
    protected entity: ModelCtor<Model<any, any>>,
    protected readonly getCurrentUser: Getter<AuthUser>,
  ) {
    super(entity);
  }

  find(filter?: FindOptions<T>) {
    if (!filter) {
      filter = {};
    }
    this.addDeletedAndCaseInWhereClause(filter);
    // Now call super
    return super.find(filter);
  }

  findOne(filter: FindOptions<T>) {
    if (!filter) {
      filter = {};
    }
    this.addDeletedAndCaseInWhereClause(filter);
    // Now call super
    return super.findOne(filter);
  }

  async findById(id: any) {
    return this.findOne({where: {id}});
  }

  count(where?: CountOptions<T>) {
    if (!where) {
      where = {};
    }
    this.addDeletedAndCaseInWhereClause(where);
    // Now call super
    return super.count(where);
  }

  async deleteById(id: any) {
    // Do soft delete, no hard delete allowed
    const data: any = {
      deleted: true,
      deletedOn: new Date(),
      deletedBy: await this.getUserId(),
    };

    return super.update(data, {where: {id}});
  }

  async delete(where: UpdateOptions<T>) {
    // Do soft delete, no hard delete allowed
    return this.update(
      {
        deleted: true,
        deletedOn: new Date(),
        deletedBy: await this.getUserId(),
      } as any,
      where,
    );
  }

  /**
   * Method to perform hard delete of entries. Take caution.
   * @param entity
   * @param options
   */
  deleteHardById(id: any) {
    // Do hard delete
    return super.deleteHard({where: {id}});
  }

  /**
   * Method to perform hard delete of entries. Take caution.
   * @param entity
   * @param options
   */
  deleteAllHard(where?: DestroyOptions<T>) {
    // Do hard delete
    return super.deleteHard(where);
  }

  private async getUserId(): Promise<string | undefined> {
    if (!this.getCurrentUser) {
      return undefined;
    }
    const currentUser = await this.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      return undefined;
    }
    return currentUser.id.toString();
  }

  addDeletedAndCaseInWhereClause(filter: FindOptions<T>) {
    if (filter.include) {
      if (Array.isArray(filter.include)) {
        for (const includeable of filter.include) {
          const includeFilter = includeable as IncludeOptions;
          includeFilter.where = this.getDeletedWhereClause(includeFilter.where);
        }
      } else {
        const includeFilter = filter.include as IncludeOptions;
        includeFilter.where = this.getDeletedWhereClause(includeFilter.where);
      }
    }
    filter.where = this.getDeletedWhereClause(filter.where);
  }

  getDeletedWhereClause(
    where?: WhereOptions<SoftDeleteEntity> | CountWithOptions<SoftDeleteEntity>,
  ) {
    if (!where) {
      return {deleted: false};
    }
    where = {...where, deleted: false};
    return where;
  }
}
