import { Integration } from '../Integration';
import { prisma } from '../../common';
import { TodoistApiClient, TodoistItem } from './TodoistApi';
import { TodoService } from '../../todos/TodoService';
import { Todo } from '../../todos/Todo';
import { ExternalTodoMapping } from '@prisma/client';
import { IntegrationTypeEnum } from '../IntegrationTypes';
let { TODOIST } = IntegrationTypeEnum;

// TODO: consider moving all Prisma code/DB interaction into the IntegrationService (in a unified way)
export class TodoistService {
  /**
   * Performs initial sync which contains of 2 steps:
   *   1. Fetching all items from Todoist and saving it into the DB
   *   2. Sends all local todos to the Todoist
   * On both steps, mapping between Todoist item ID and local TodoID is saved as externalTodoMapping records
   */
  static async doInitialSync(createdIntegration: Integration): Promise<void> {
    const apiClient = new TodoistApiClient(
      createdIntegration.details.apiKey as string,
    );

    const ownerId = createdIntegration.ownerId;
    const integrationId = createdIntegration.id;

    const localTodosToPush = await TodoService.getOwnTodos(
      { take: 100 },
      createdIntegration.ownerId,
    );

    const todoistTasks = await apiClient.getAllItems();

    await this.saveTodoistItemsToDB(todoistTasks, integrationId, ownerId);
    await this.pushTodosToTodoist(apiClient, localTodosToPush, integrationId);
  }

  private static async saveTodoistItemsToDB(
    todoistTasks: TodoistItem[],
    integrationId: string,
    ownerId: string,
  ) {
    await prisma.$transaction(
      todoistTasks.map((todoistTask) =>
        prisma.externalTodoMapping.create({
          data: {
            externalTodoId: todoistTask.id,
            integration: {
              connect: {
                id: integrationId,
              },
            },
            todo: { create: { title: todoistTask.content, ownerId } },
          },
        }),
      ),
    );
  }

  static async pushSingleTodoToTodoist(integration: Integration, todo: Todo) {
    const apiClient = new TodoistApiClient(
      integration.details.apiKey as string,
    );

    return this.pushTodosToTodoist(apiClient, [todo], integration.id);
  }

  static async toggleTodoCompletionInTodoist(
    externalTodoMapping: ExternalTodoMapping,
    todo: Todo,
  ) {
    const integration = (await prisma.externalTodoMapping
      .findFirst({
        where: {
          todoId: todo.id,
          integration: {
            type: TODOIST,
          },
        },
      })
      .integration()) as Integration;

    const apiClient = new TodoistApiClient(
      integration.details.apiKey as string,
    );

    return apiClient.toggleItemCompletion(
      externalTodoMapping.externalTodoId,
      Boolean(todo.completedAt),
    );
  }

  private static async pushTodosToTodoist(
    apiClient: TodoistApiClient,
    todosToPush: Todo[],
    integrationId: string,
  ) {
    const preparedDataForApi = todosToPush.map((todo) => ({
      content: todo.title,
      temp_id: todo.id,
    }));

    // Creating Todoist items
    const createdItemsResponse =
      await apiClient.createItemsInInbox(preparedDataForApi);

    // Creating local mapping between existing Todos and freshly created Todoist items
    await prisma.externalTodoMapping.createMany({
      data: Object.keys(createdItemsResponse).map((todoId) => ({
        externalTodoId: createdItemsResponse[todoId],
        todoId,
        integrationId,
      })),
    });
  }

  // TODO: add todoist webhook
}
