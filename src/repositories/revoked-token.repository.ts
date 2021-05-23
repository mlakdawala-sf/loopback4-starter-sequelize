import {inject} from '@loopback/core';
import {DefaultKeyValueRepository} from '@loopback/repository';
import {RedisDataSource} from '../datasources/redis.datasource';
import {RevokedToken} from '../models';

export class RevokedTokenRepository extends DefaultKeyValueRepository<RevokedToken> {
  constructor(
    @inject(`datasources.AuthCache`)
    dataSource: RedisDataSource,
  ) {
    super(RevokedToken, dataSource);
  }
}
