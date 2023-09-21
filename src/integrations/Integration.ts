import 'reflect-metadata';
import { ObjectType, Field, ID, registerEnumType } from 'type-graphql';
import { User } from '../users/User';
import { Prisma } from '@prisma/client';

@ObjectType()
export class Integration {
  @Field((type) => ID)
  id: string;

  @Field((type) => IntegrationTypeEnum)
  type: string;

  @Field()
  createdAt: Date;

  @Field((type) => TodoistIntegrationDetails)
  details: Prisma.JsonValue;

  @Field((type) => User)
  owner?: User;
}

enum IntegrationTypeEnum {
  TODOIST = 'TODOIST',
}

registerEnumType(IntegrationTypeEnum, {
  name: 'IntegrationTypeEnum',
});

@ObjectType()
export class TodoistIntegrationDetails {
  @Field()
  apiKey: string;
}
