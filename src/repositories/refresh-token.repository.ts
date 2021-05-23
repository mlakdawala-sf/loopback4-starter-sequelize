import {inject} from '@loopback/core';
import {DefaultKeyValueRepository} from '@loopback/repository';
import {RedisDataSource} from '../datasources/redis.datasource';
import {RefreshToken} from '../models';

export class RefreshTokenRepository extends DefaultKeyValueRepository<RefreshToken> {
  constructor(
    @inject(`datasources.AuthCache`)
    dataSource: RedisDataSource,
  ) {
    super(RefreshToken, dataSource);
  }
}
