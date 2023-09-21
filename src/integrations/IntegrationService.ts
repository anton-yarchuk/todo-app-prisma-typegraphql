import { prisma } from '../common';
import { Integration, TodoistIntegrationDetails } from './Integration';

// TODO: use @Service instead of static classes methods
export class IntegrationService {
  static async connectToTodoistParty(
    userId: string,
    details: TodoistIntegrationDetails,
  ): Promise<Integration> {
    return prisma.integration.create({
      data: {
        type: 'TODOIST',
        ownerId: userId,
        // destructuring is required due to https://github.com/microsoft/TypeScript/issues/15300
        details: { ...details },
      },
    });
  }
}
