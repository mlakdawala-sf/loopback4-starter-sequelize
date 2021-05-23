import {repository} from '@loopback/repository';
import {del, get, param, patch, post, requestBody} from '@loopback/rest';
import {authenticate, STRATEGY} from 'loopback4-authentication';
import {authorize} from 'loopback4-authorization';
import {AuditLog} from '../../models';
import {AuditLogRepository} from '../../repositories';
import {PermissionKey} from '../auth/permission-key.enum';
// const schema: SchemaObject | ReferenceObject = sequelizeToSchema(AuditLog);

export class AuditLogController {
  constructor(
    @repository(AuditLogRepository)
    public auditLogRepository: AuditLogRepository,
  ) {}

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: [PermissionKey.CreateAudit]})
  @post('/audit-logs', {
    responses: {
      '200': {
        description: 'AuditLog model instance',
      },
    },
  })
  async create(@requestBody() auditLog: AuditLog): Promise<AuditLog> {
    return this.auditLogRepository.create(auditLog);
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: [PermissionKey.ViewAudit]})
  @get('/audit-logs/count', {
    responses: {
      '200': {
        description: 'AuditLog model count',
      },
    },
  })
  async count(
    @param.query.object('where')
    where?: any,
  ): Promise<number> {
    return this.auditLogRepository.count(where);
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: [PermissionKey.ViewAudit]})
  @get('/audit-logs', {
    responses: {
      '200': {
        description: 'Array of AuditLog model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': AuditLog}},
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter')
    filter?: any,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.find(filter);
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: [PermissionKey.ViewAudit]})
  @get('/audit-logs/{id}', {
    responses: {
      '200': {
        description: 'AuditLog model instance',
        content: {'application/json': {schema: {'x-ts-type': AuditLog}}},
      },
    },
  })
  async findById(
    @param.path.number('id') id: string,
  ): Promise<AuditLog | null> {
    return this.auditLogRepository.findById(id);
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: [PermissionKey.UpdateAudit]})
  @patch('/audit-logs/{id}', {
    responses: {
      '204': {
        description: 'AuditLog PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: string,
    @requestBody() auditLog: AuditLog,
  ): Promise<void> {
    await this.auditLogRepository.update(auditLog, {where: {id}});
  }

  // @authenticate(STRATEGY.BEARER)
  // @authorize({permissions: [PermissionKey.UpdateAudit]})
  // @put('/audit-logs/{id}', {
  //   responses: {
  //     '204': {
  //       description: 'AuditLog PUT success',
  //     },
  //   },
  // })
  // async replaceById(
  //   @param.path.number('id') id: string,
  //   @requestBody() auditLog: AuditLog,
  // ): Promise<void> {
  //   await this.auditLogRepository.replaceById(id, auditLog);
  // }

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: [PermissionKey.DeleteAudit]})
  @del('/audit-logs/{id}', {
    responses: {
      '204': {
        description: 'AuditLog DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: string): Promise<void> {
    await this.auditLogRepository.deleteHard({where: {id}});
  }
}
