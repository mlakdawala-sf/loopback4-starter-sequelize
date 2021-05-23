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

// export const MainDataSource = () => {
//   return new Sequelize({
//     database: 'lbstarter',
//     dialect: 'postgres',
//     username: 'postgres',
//     password: 'root',

//     models: [
//       UserCredentials,
//       User,
//       AuthClient,
//       Role,
//       Tenant,
//       AuditLog,
//       UserTenant,
//     ], // or [Player, Team],
//   });
// };

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
    // const dialect = this.dsConfig.dialect ?? 'postgres';
    // const sync = this.dsConfig.sync ?? false;
    if (process.env.NODE_ENV === 'test') {
      console.log('completed1');

      // this.sequelize = new Sequelize({
      //   dialect: 'sqlite',
      //   storage: ':memory:',
      //   models,
      //   // username: process.env.DB_USER,
      //   // password: process.env.DB_PASSWORD,
      //   // database: process.env.DB_DATABASE,

      //   sync: {force: true},
      // });
      // console.log(this.sequelize);
      new Sequelize('sqlite::memory:', {models, sync: {force: true}});

      console.log('completed2');
    } else {
      this.sequelize = new Sequelize({
        database: process.env.DB_DATABASE,
        dialect: 'postgres',
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        models,
      });
      // new Sequelize('sqlite::memory:', {models, sync: {force: true}});
    }
  }
  stop() {
    this.sequelize.close();
  }
}
