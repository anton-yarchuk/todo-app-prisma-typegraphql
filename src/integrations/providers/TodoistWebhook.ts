import { prisma } from '../../common';
import { IntegrationTypeEnum } from '../IntegrationTypes';

// @ts-ignore
expressRouter.post('/todoist-webhook', async (request, response) => {
  // First, validate the request
  // @ts-ignore
  const requestPayload = await validateRequest(
    request.body,
    request.headers['X-Todoist-Hmac-SHA256'],
    process.env.TODOIST_WEBHOOK_SECRET,
  );

  // Find corresponding integration
  const integration = await prisma.integration.findFirst({
    where: {
      type: IntegrationTypeEnum.TODOIST,
      // During the OAuth connection, we will receive the Todoist User Id and save it in Integration.externalUserId
      // @ts-ignore
      externalUserId: requestPayload.user_id,
    },
  });

  // Update DB data depending on the Todoist event type
  switch (requestPayload.event_name) {
    case 'item:added':
      // Create a new todoItem in DB
      await prisma.todo.create({
        data: {
          title: requestPayload.event_data.content,
          // Attach it to the correct user in DB
          owner: {
            connect: {
              id: integration.ownerId,
            },
          },
          // Create a new mapping item for future updates between our service and Todoist
          externalTodoRefs: {
            create: {
              externalTodoId: requestPayload.event_data.id,
              integration: {
                connect: {
                  id: integration.id,
                },
              },
            },
          },
        },
      });
      break;

    case 'item:completed':
    case 'item:uncompleted':
      // Item already should be in DB, so we already should have externalTodoRef.
      const externalTodoRef = await prisma.externalTodoRef.findFirst({
        where: {
          externalTodoId: requestPayload.event_data.id,
          integration: { id: integration.id },
        },
      });

      // If, for some reason, we don't have externalTodoRef in DB (race condition?) - we can create it, no problem

      // Update existing todoItem in the DB
      await prisma.todo.update({
        where: {
          id: externalTodoRef.todoId,
        },
        data: {
          completedAt: requestPayload.event_data.completed_at
            ? new Date()
            : null,
        },
      });

      break;
  }

  // TODO: Add additional items such as 'item:updated', 'item:deleted', etc.

  return response.status(200).send(`OK`);
});
