import { prisma } from '../common';
import { Integration, TodoistIntegrationDetails } from './Integration';
import { TodoistService } from './providers/TodoistService';
import { Todo } from '../todos/Todo';
import { IntegrationTypeEnum } from './IntegrationTypes';
let { TODOIST } = IntegrationTypeEnum;

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

    // TODO: publish an event instead of blocking the request; handle it in a separate flow or service
    await IntegrationService.doInitialSync(createdIntegration, TODOIST);

    return createdIntegration;
  }

  static async createTaskInExternalServices(todo: Todo): Promise<void> {
    const promises = [];
    const activeIntegrations = (await prisma.integration.findMany({
      where: { ownerId: todo.ownerId },
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
    const externalTodoRefs = await prisma.externalTodoRef.findMany({
      where: { todoId: todo.id },
      include: {
        integration: true,
      },
    });

    // For each mapping of a task, prepare a promise for toggling completion in third-party service
    for (const externalTodoRef of externalTodoRefs) {
      switch (externalTodoRef.integration.type) {
        case TODOIST:
          promises.push(
            TodoistService.toggleTodoCompletionInTodoist(externalTodoRef, todo),
          );
          break;
        default:
          console.error(
            `Unknown type of integration - ${externalTodoRef.integration.type}`,
          );
      }
    }

    await Promise.all(promises);
  }

  static async doInitialSync(
    integration: Integration,
    type: IntegrationTypeEnum,
  ) {
    switch (type) {
      case IntegrationTypeEnum.TODOIST: {
        return TodoistService.doInitialSync(integration);
      }
      default: {
        console.error(`doInitialSync: Unknown integration type - ${type}`);
      }
    }
  }
}
