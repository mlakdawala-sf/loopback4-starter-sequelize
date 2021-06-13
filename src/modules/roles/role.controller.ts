import {CountSchema, repository} from '@loopback/repository';
import {del, get, param, patch, post, requestBody} from '@loopback/rest';
import {authenticate, STRATEGY} from 'loopback4-authentication';
import {authorize} from 'loopback4-authorization';
import {CountOptions, UpdateOptions} from 'sequelize/types';
import {Role} from '../../models';
import {RoleRepository} from '../../repositories';
import {PermissionKey} from '../auth/permission-key.enum';

export class RoleController {
  constructor(
    @repository(RoleRepository)
    public roleRepository: RoleRepository,
  ) {}

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: [PermissionKey.CreateRole]})
  @post('/roles', {
    responses: {
      '200': {
        description: 'Role model instance',
        content: {'application/json': {schema: {'x-ts-type': Role}}},
      },
    },
  })
  async create(@requestBody() role: Role): Promise<Role> {
    return this.roleRepository.create(role);
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: [PermissionKey.ViewRole]})
  @get('/roles/count', {
    responses: {
      '200': {
        description: 'Role model count',
      },
    },
  })
  async count(
    @param.query.object('where') where?: CountOptions<Role>,
  ): Promise<number> {
    return this.roleRepository.count(where);
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: ['*']})
  @get('/roles', {
    responses: {
      '200': {
        description: 'Array of Role model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': Role}},
          },
        },
      },
    },
  })
  async find(@param.query.object('filter') filter?: any): Promise<Role[]> {
    return this.roleRepository.find(filter);
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: [PermissionKey.UpdateRole]})
  @patch('/roles', {
    responses: {
      '200': {
        description: 'Role PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody() role: Role,
    @param.query.object('where') where?: UpdateOptions<Role>,
  ) {
    return this.roleRepository.update(role, where);
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: [PermissionKey.ViewRole]})
  @get('/roles/{id}', {
    responses: {
      '200': {
        description: 'Role model instance',
        content: {'application/json': {schema: {'x-ts-type': Role}}},
      },
    },
  })
  async findById(@param.path.number('id') id: string): Promise<Role | null> {
    return this.roleRepository.findById(id);
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: [PermissionKey.UpdateRole]})
  @patch('/roles/{id}', {
    responses: {
      '204': {
        description: 'Role PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: string,
    @requestBody() role: Role,
  ): Promise<void> {
    await this.roleRepository.updateById(role, id);
  }

  // @authenticate(STRATEGY.BEARER)
  // @authorize({permissions: [PermissionKey.UpdateRole]})
  // @put('/roles/{id}', {
  //   responses: {
  //     '204': {
  //       description: 'Role PUT success',
  //     },
  //   },
  // })
  // async replaceById(
  //   @param.path.number('id') id: string,
  //   @requestBody() role: Role,
  // ): Promise<void> {
  //   await this.roleRepository.replaceById(id, role);
  // }

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: [PermissionKey.DeleteRole]})
  @del('/roles/{id}', {
    responses: {
      '204': {
        description: 'Role DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: string): Promise<void> {
    await this.roleRepository.deleteById(id);
  }
}
