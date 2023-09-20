import 'reflect-metadata';
import { ObjectType, Field, ID } from 'type-graphql';
import { List } from '../lists/List';
import { Todo } from '../todos/Todo';

@ObjectType()
export class User {
  @Field((type) => ID)
  readonly id: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field((type) => [List])
  lists: [List];

  @Field((type) => [Todo])
  todos: [Todo];
}
