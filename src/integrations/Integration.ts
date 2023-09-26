import 'reflect-metadata';
import { ObjectType, Field, ID } from 'type-graphql';
import { User } from '../users/User';
import { JsonObject } from '@prisma/client/runtime/library';
import { IntegrationTypeEnum } from './IntegrationTypes';

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
