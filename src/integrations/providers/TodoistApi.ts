import axios from 'axios';
import { randomUUID } from 'crypto';

/**
 * A wrapper around the Todoist Sync API
 */
export class TodoistApiClient {
  // Obtainable via todoist.com (Settings > Integrations > Developer > Copy API token)
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Fetches all items(tasks) of a user from all Todoist lists
   */
  async getAllItems(): Promise<TodoistItem[]> {
    // TODO: incremental sync via sync_token for splitting request into chunks
    const response = await this.executeRequest({
      sync_token: '*',
      resource_types: '["items"]',
    });
    return response?.data?.items;
  }

  /**
   * Creates multiple Todoist items(todos) in the "Inbox" list
   *
   * @returns {Promise} mapping between Todoist ItemId and temp_id(which represents TodoId in the DB)
   */
  async createItemsInInbox(
    data: TodoistItemCreateCommand[],
  ): Promise<{ [key: string]: string }[]> {
    const response = await this.executeRequest({
      commands: JSON.stringify(
        data.map((creationCommand) => ({
          type: 'item_add',
          temp_id: creationCommand.temp_id,
          uuid: randomUUID(),
          args: {
            content: creationCommand.content,
          },
        })),
      ),
    });
    return response?.data?.temp_id_mapping;
  }

  /**
   * Toggles an item completion field
   */
  async toggleItemCompletion(
    itemId: string,
    isCompleted: boolean,
  ): Promise<any> {
    return this.executeRequest({
      commands: JSON.stringify([
        {
          type: isCompleted ? 'item_complete' : 'item_uncomplete',
          uuid: randomUUID(),
          args: {
            id: itemId,
          },
        },
      ]),
    });
  }

  private async executeRequest(data: object): Promise<any> {
    return axios.post('https://api.todoist.com/sync/v9/sync', data, {
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${this.apiKey}`,
      },
    });
  }
}

export interface TodoistItem {
  id: string;
  content: string;
}

export interface TodoistItemCreateCommand {
  content: string;
  temp_id: string;
}
