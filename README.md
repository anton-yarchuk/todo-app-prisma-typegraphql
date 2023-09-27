# Todo app

I decided to make this project more educational for myself, so I've picked some tools that are new to me (such as
[Prisma](https://www.prisma.io) for ORM and [TypeGraphQL](https://typegraphql.com/) for building GraphQL schemas).

Any feedback or recommendations are much appreciated.

## How to launch

```sh
cp .env_template_dev .env # create .env file out of the template
docker compose up # launching Postgres
npm i
npx prisma migrate dev # apply DB migrations and execute seed

npm run dev
```

Access the local sandbox on http://localhost:4000/

## How third-party integration is working

The app is integrated with Todoist via Todoist Sync API.

### Data model:

When a user is integrating with a third-party todo tool, a new `Integration` record is created. The relation here is one-to-many, so a user may be integrated to multiple services (e.g Todoist and Google Calendar) or have multiple integrations
with the same service (e.g. work and personal Google Calendars)

A single integration looks like:

```json5
{
  "userId": "000",
  "type": "TODOIST",
  "details": {
    //    all the necessary data for the integration (tokens, api keys, etc.)
  }
}
```

During the initial synchronization, for each `Todo` record of a user, we are creating a `ExternalTodoRef` record (one-to-one relation) for keeping track of connections between local todos and a todo items on a third-party side. In case of multiple integrations connected at the same time, multiple `ExternalTodoRef` records will be created for a single local `Todo` record. Example:

```json5
[
  {
    "todoId": "our_todo_ID_1",
    "integrationId": "TOD_000", // TODOIST integration of our user
    "externalTodoId": "todoist_ID_1"
  },
  {
    "todoId": "our_todo_ID_1", // the same task
    "integrationId": "GOOG_111", // GOOGLE CALENDAR integration of the same user
    "externalTodoId": "g_cal_ID_1"
  }
]
```

### How the sync works:

#### 1. Initial sync

When the user is creating a new integration (OAuth or by providing API_KEY via graphql mutation) the app is performing a full sync:

- Fetches all items(todos) from the Todoist, saves these as `Todo`s records in the local DB. Also, we are creating necessary `ExternalTodoRefs` for linking between these two
- All local `Todo`s are pushed to the Todoist via API. Also, necessary `ExternalTodoRefs` records as saved in the DB.

At the end of this stage, we have the same list of todos in both systems + we have mapping/referencing info 

#### 2. Keeping data in sync

- When something is changing on our end - we are updating todos on Todoist's side via API ([Todoist API client](./src/integrations/providers/TodoistApi.ts))
- When something is changing on the Todoist's side - The Todoist is notifying us via `wehbook request`
  - _Note: The project grew more than I expected. For saving time, I decided to shortcut the webhook code. I'm planning to finish it later if I will have a spare time. Nevertheless, I've written it as pseudocode ([pseudocode Todoist webhook handler](./src/integrations/providers/TodoistWebhook.ts)) based on Todoist API docs. I hope this is not an issue, since the logic there is quite straightforward and the end result will look very close to this pseudocode. LMK_

## Assumptions and Shortcut
- Some of a CRUD actions are not implemented. I've implemented only those mentioned in the challenge description + some more, but, for example, there is no action for deleting a `todo list`.
- I assume, that complete Auth flow is out of the scope for this project, so I've replaced it by simply adding `userId` to the request context. This way I was able to build proper DB models, relations, filtering, etc. LMK   
- There is no queueing for external API calls. It works for POC, but with time, a queueing mechanism should be introduced (e.g. RabbitMQ). Especially it is required for initial sync since it may take some time and we don't want to block the request for the whole process.
- As mentioned above - the Todoist webhook handler is written in pseudocode
- There is no Docker file yet (but it is mentioned in Todo section below)

## Assumptions
- Recurring tasks, tags, lists syncing etc. are out of the scope.
- Realtime / GraphQL subscriptions are out of the scope (but it's almost a must for integration with a third party service in background)
- `docker compose` may look like an unnecessary piece since there is only one service there (Postgres). It is true, but imho it is a nice to have thing because:
  - with time, the app will require additional services (e.g. Redis, RabbitMQ, etc.)
  - it works as a nice documentation about necessary external services, including version, some parts of configurations, etc.

## Todo
- [ ] Add DB indexes, especially for querying todos
- [ ] Add TSLint
- [ ] Implement and debug the Todoist webhook code
- [ ] Docker image for the app
- [ ] Adding docker image to the docker compose for launching the whole stack via `docker compose up`
