import 'reflect-metadata';
import { Resolver, Ctx, Mutation, Arg } from 'type-graphql';
import { Context } from '../common';
import { Integration } from './Integration';
import { IntegrationService } from './IntegrationService';
import { TodoistIntegrationDetailsInput } from './IntegrationTypes';

@Resolver(Integration)
export class IntegrationResolver {
  @Mutation((returns) => Integration)
  async createTodoistIntegration(
    @Arg('data') input: TodoistIntegrationDetailsInput,
    @Ctx() ctx: Context,
  ) {
    return IntegrationService.connectToTodoistParty(ctx.userId, input);
  }
}
