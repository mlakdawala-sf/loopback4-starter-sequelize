import {
  CountOptions,
  DestroyOptions,
  FindOptions,
  ModelCtor,
  UpdateOptions,
} from 'sequelize';
import {Model} from 'sequelize-typescript';

export abstract class DefaultCrudRepository<T extends Model<any, any>> {
  constructor(protected entity: ModelCtor<Model<any, any>>) {}

  async create(data: Partial<T>) {
    if (data instanceof Model) {
      return (await data.save()) as T;
    } else {
      const dataBuilt = this.entity.build(data);
      return (await dataBuilt.save()) as T;
    }
  }
  async createAll(data: Partial<T>[]) {
    return (await this.entity.bulkCreate(data)) as T[];
  }

  async find(filter?: FindOptions<T>): Promise<T[]> {
    return (await this.entity.findAll(filter)) as T[];
  }

  async findOne(filter?: FindOptions<T>): Promise<T | null> {
    return (this.entity.findOne(filter) as unknown) as Promise<T | null>;
  }

  async findById(id: any): Promise<T | null> {
    return (this.entity.findByPk(id) as unknown) as Promise<T | null>;
  }

  update(data: Partial<T>, options?: UpdateOptions<T>) {
    if (!options) {
      options = {where: {}};
    }
    return this.entity.update(data, options);
  }

  updateById(data: Partial<T>, id: any) {
    return this.entity.update(data, {where: {id}});
  }

  count(where?: CountOptions<T>) {
    return this.entity.count(where);
  }

  deleteHard(options?: DestroyOptions<T>) {
    return this.entity.destroy(options);
  }
}
