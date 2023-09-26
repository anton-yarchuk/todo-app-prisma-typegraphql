import { Field, InputType, registerEnumType } from 'type-graphql';

@InputType()
export class TodoistIntegrationDetailsInput {
  @Field()
  apiKey: string;
}

export enum IntegrationTypeEnum {
  TODOIST = 'TODOIST',
}

registerEnumType(IntegrationTypeEnum, {
  name: 'IntegrationTypeEnum',
});
