import { prisma } from '../common';
import { Integration, TodoistIntegrationDetails } from './Integration';
import { TodoistService } from './providers/TodoistService';

export class IntegrationService {
  static async connectToTodoistParty(
    userId: string,
    details: TodoistIntegrationDetails,
  ): Promise<Integration> {
    const createdIntegration = await prisma.integration.create({
      data: {
        type: 'TODOIST',
        ownerId: userId,
        // destructuring is required due to https://github.com/microsoft/TypeScript/issues/15300
        details: { ...details },
      },
    });

    // TODO: emit and event instead of blocking the request
    await TodoistService.doInitialSync(createdIntegration);

    return createdIntegration;
  }

  // TODO: add createExternalTask / completeExternalTask
}
