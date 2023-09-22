import { prisma } from '../common';
import {
  Integration,
  IntegrationTypeEnum,
  TodoistIntegrationDetails,
} from './Integration';
let { TODOIST } = IntegrationTypeEnum;
import { TodoistService } from './providers/TodoistService';
import { Todo } from '../todos/Todo';

export class IntegrationService {
  static async connectToTodoistParty(
    userId: string,
    details: TodoistIntegrationDetails,
  ): Promise<Integration> {
    const createdIntegration = (await prisma.integration.create({
      data: {
        type: TODOIST,
        ownerId: userId,
        // destructuring is required due to https://github.com/microsoft/TypeScript/issues/15300
        details: { ...details },
      },
    })) as Integration;

    // TODO: emit and event instead of blocking the request
    await TodoistService.doInitialSync(createdIntegration);

    return createdIntegration;
  }

  static async createTaskInExternalServices(
    todo: Todo,
    userId: string,
  ): Promise<void> {
    const promises = [];
    const activeIntegrations = (await prisma.integration.findMany({
      where: { ownerId: userId },
    })) as Integration[];

    for (const integration of activeIntegrations) {
      switch (integration.type) {
        case TODOIST:
          promises.push(
            TodoistService.pushSingleTodoToTodoist(integration, todo),
          );
          break;
        default:
          console.error(`Unknown type of Integration - ${integration.type}`);
      }
    }

    await Promise.all(promises);
  }

  static async toggleTaskCompletionInExternalServices(
    todo: Todo,
  ): Promise<void> {
    const promises = [];
    const externalTodoMappings = await prisma.externalTodoMapping.findMany({
      where: { todoId: todo.id },
      include: {
        integration: true,
      },
    });

    // For each mapping of a task, prepare a promise for toggling completion in third-party service
    for (const externalTodoMapping of externalTodoMappings) {
      switch (externalTodoMapping.integration.type) {
        case TODOIST:
          promises.push(
            TodoistService.toggleTodoCompletionInTodoist(
              externalTodoMapping,
              todo,
            ),
          );
          break;
        default:
          console.error(
            `Unknown type of integration - ${externalTodoMapping.integration.type}`,
          );
      }
    }

    await Promise.all(promises);
  }
}
