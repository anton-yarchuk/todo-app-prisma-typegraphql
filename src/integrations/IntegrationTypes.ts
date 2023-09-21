import { Field, InputType } from 'type-graphql';

@InputType()
export class TodoistIntegrationDetailsInput {
  @Field()
  apiKey: string;
}
