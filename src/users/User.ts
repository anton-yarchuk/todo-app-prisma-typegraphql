import 'reflect-metadata';
import { ObjectType, Field, ID } from 'type-graphql';
import { List } from '../lists/List';
import { Todo } from '../todos/Todo';
import { Length } from 'class-validator';

@ObjectType()
export class User {
  @Field((type) => ID)
  id: string;

  @Field()
  @Length(1, 50)
  name: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field((type) => [List])
  lists?: [List];

  @Field((type) => [Todo])
  todos?: [Todo];
}
