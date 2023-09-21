import 'reflect-metadata';
import { ObjectType, Field, ID, registerEnumType } from 'type-graphql';
import { User } from '../users/User';
import { JsonObject } from '@prisma/client/runtime/library';

@ObjectType()
export class TodoistIntegrationDetails {
  @Field()
  apiKey: string;
}

@ObjectType()
export class Integration {
  @Field((type) => ID)
  id: string;

  @Field((type) => IntegrationTypeEnum)
  type: string;

  @Field()
  createdAt: Date;

  @Field((type) => TodoistIntegrationDetails)
  details: JsonObject;

  @Field((type) => User)
  owner?: User;

  // no @Field decorator, field is not accessible via API calls
  ownerId: string;
}

enum IntegrationTypeEnum {
  TODOIST = 'TODOIST',
}

registerEnumType(IntegrationTypeEnum, {
  name: 'IntegrationTypeEnum',
});
