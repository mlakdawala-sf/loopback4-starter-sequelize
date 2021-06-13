import {CountSchema, repository} from '@loopback/repository';
import {
  del,
  get,
  HttpErrors,
  param,
  patch,
  post,
  put,
  requestBody,
} from '@loopback/rest';
import {authenticate, STRATEGY} from 'loopback4-authentication';
import {authorize} from 'loopback4-authorization';
import {CountOptions, FindOptions, UpdateOptions} from 'sequelize/types';
import {User} from '../../models';
import {UserRepository, UserTenantRepository} from '../../repositories';
import {PermissionKey} from '../auth/permission-key.enum';

export class UserController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(UserTenantRepository)
    public userTenantRepo: UserTenantRepository,
  ) {}

  @authenticate(STRATEGY.BEARER)
  @authorize({
    permissions: ['*'],
  })
  @post('/users', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: {'x-ts-type': User}}},
      },
    },
  })
  async create(@requestBody() user: User): Promise<User> {
    if (!user.defaultTenant) {
      throw new HttpErrors.UnprocessableEntity(
        'User Id or Default Tenant Id is missing in the request parameters',
      );
    }
    const response = await this.userRepository.create(user);
    await this.userTenantRepo.createByUser(response);

    return response;
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({
    permissions: [
      PermissionKey.ViewAnyUser,
      PermissionKey.ViewOwnUser,
      PermissionKey.ViewTenantUser,
    ],
  })
  @get('/users/count', {
    responses: {
      '200': {
        description: 'User model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where') where?: CountOptions<User>,
  ): Promise<number> {
    return this.userRepository.count(where);
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({
    permissions: [
      PermissionKey.ViewAnyUser,
      PermissionKey.ViewOwnUser,
      PermissionKey.ViewTenantUser,
    ],
  })
  @get('/users', {
    responses: {
      '200': {
        description: 'Array of User model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': User}},
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter')
    filter?: FindOptions<User>,
  ): Promise<User[]> {
    return this.userRepository.find(filter);
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({
    permissions: [
      PermissionKey.UpdateAnyUser,
      PermissionKey.UpdateOwnUser,
      PermissionKey.UpdateTenantUser,
    ],
  })
  @patch('/users', {
    responses: {
      '200': {
        description: 'User PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody() user: User,
    @param.query.object('where') where?: UpdateOptions<User>,
  ) {
    return this.userRepository.update(user, where);
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({
    permissions: [
      PermissionKey.ViewAnyUser,
      PermissionKey.ViewOwnUser,
      PermissionKey.ViewTenantUser,
    ],
  })
  @get('/users/{id}', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: {'x-ts-type': User}}},
      },
    },
  })
  async findById(@param.path.number('id') id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({
    permissions: [
      PermissionKey.UpdateAnyUser,
      PermissionKey.UpdateOwnUser,
      PermissionKey.UpdateTenantUser,
    ],
  })
  @patch('/users/{id}', {
    responses: {
      '204': {
        description: 'User PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: string,
    @requestBody() user: User,
  ): Promise<void> {
    await this.userRepository.updateById(id, user);
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({
    permissions: [
      PermissionKey.UpdateAnyUser,
      PermissionKey.UpdateOwnUser,
      PermissionKey.UpdateTenantUser,
    ],
  })
  @put('/users/{id}', {
    responses: {
      '204': {
        description: 'User PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: string,
    @requestBody() user: User,
  ): Promise<void> {
    await this.userRepository.updateById(id, user);
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({
    permissions: [PermissionKey.DeleteAnyUser, PermissionKey.DeleteTenantUser],
  })
  @del('/users/{id}', {
    responses: {
      '204': {
        description: 'User DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: string): Promise<void> {
    await this.userRepository.deleteById(id);
  }
}
