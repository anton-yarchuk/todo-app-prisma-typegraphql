# Todo app

I decided to make this project more educational for myself, so I've picked some tools that are new to me (such as
[Prisma](https://www.prisma.io) for ORM and [TypeGraphQL](https://typegraphql.com/) for building GraphQL schemas).

Any feedback or recommendations are much appreciated.

## How to launch

```sh
cp .env_template_dev .env # create .env file out of the template
docker compose up # launching PG
npm i
prisma migrate dev # apply DB migrations and execute seed

npm run dev
```

## How third-party integration is working

The app is integrated with Todoist via Todoist Sync API.

### Data model:

Each `User` may have multiple `Integration`s. A single integration looks like:

```json5
{
  "userId": "000",
  "type": "TODOIST",
  "details": {
    //    all the necessary data for the integration (tokens, api keys, etc.)
  }
}
```

This way a user may be integrated to multiple services (e.g Todoist and Google Calendar) or have multiple integrations
with the same service (e.g. work and personal Google Calendars)

Also, for each `Todo` item in our DB, we are creating multiple `ExternalTodoMappings` for mapping between native todos and external ones:

```json5
[
  {
    "todoId": "our_todo_ID_1",
    "integrationId": "TOD_000", // TODOIST
    "externalTodoId": "todoist_ID_1"
  },
  {
    "todoId": "our_todo_ID_1", // the same task
    "integrationId": "GOOG_111", // GOOGLE CALENDAR
    "externalTodoId": "g_cal_ID_1"
  }
]
```

### How sync works:

#### Initial sync

When the user is creating a new integration (OAuth or by providing API_KEY via graphql mutation) the app is performing a full sync:

- Fetches all tasks from the Todoist and creates necessary `ExternalTodoMappings`
- Pushes all local tasks to the Todoist and saves mapping

#### Keeping data in sync

- When something is changing on our end, mapped Todoist's items are updated via API ([Todoist API client](./src/integrations/providers/TodoistApi.ts))
- When something is changing on the Todoist's side, Todoist service is notifying us via `wehbook request`
  - The project grew more than I expected. For saving time, I decided not to implement the actual webhook (it required creating a Todoist App, handling OAuth etc.) but wrote it as a pseudocode ([pseudocode Todoist webhook handler](./src/integrations/providers/TodoistWebhook.ts)) based on Todoist API doc. I hope this is not an issue, since the logic there is quite straightforward.

## Assumptions and shortcut 
- (shortcut) I assume, that complete Auth flow is out of the scope for this project, so I've mocked it (by adding `userId` to the request context) for building proper DB models, relations, etc.   
- (shortcut) There is no queueing for external calls (Todoist API calls). It works for POC, but with more time a queueing mechanism should be introduced (e.g. RabbitMQ)
- (shortcut) Again, Todoist webhook handler is written in pseudocode
- (shortcut) No docker file for the app (it is mentioned in Todo section below)
- (assumption) Recurring tasks, tags, etc. are out of scope
- (assumption) Realtime / GraphQL subscriptions are out of scope
- `docker compose` may look like an unnecessary piece since there is only one service there (PG). Yes, right now it is true, but I like to add docker-compose anyway, since:
  - with time, the app will require additional services (e.g. Redis, RabbitMQ, etc.)
  - it works as a clear documentation about necessary services and its version

## Todo
- [ ] Add DB indexes, especially for querying todos
- [ ] Add TSLint
- [ ] Docker image for the app
- [ ] Adding docker image to the docker compose for launching the whole stack via `docker compose up`
