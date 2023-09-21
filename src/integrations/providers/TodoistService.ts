import { Integration } from '../Integration';

export class TodoistService {
  static async doInitialSync(createdIntegration: Integration): Promise<void> {
    // TODO: save all tasks from todoist + create connectors
    // TODO: push all tasks to todoist + create connectors based on the response
    return;
  }

  // TODO: add todoist webhook
}
