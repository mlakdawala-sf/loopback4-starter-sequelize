import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {Sequelize} from 'sequelize-typescript';
import {
  AuditLog,
  AuthClient,
  Role,
  Tenant,
  User,
  UserCredentials,
  UserTenant,
  UserTenantPermission,
} from '../models';

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class PgdbDataSource implements LifeCycleObserver {
  sequelize: Sequelize;
  constructor(
    @inject('datasources.config.pgdb', {optional: true})
    private dsConfig: any,
  ) {}
  async init() {
    const models = [
      UserCredentials,
      User,
      AuthClient,
      Role,
      Tenant,
      AuditLog,
      UserTenant,
      UserTenantPermission,
    ];
    if (process.env.NODE_ENV === 'test') {
      new Sequelize('sqlite::memory:', {models, sync: {force: true}});
    } else {
      this.sequelize = new Sequelize({
        database: process.env.DB_DATABASE,
        dialect: 'postgres',
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        models,
      });
    }
  }
  stop() {
    this.sequelize.close();
  }
}
