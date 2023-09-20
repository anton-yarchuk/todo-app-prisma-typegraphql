import 'reflect-metadata';
import { ObjectType, Field, ID } from 'type-graphql';
import { User } from '../user/User';
import { Todo } from '../todos/Todo';

@ObjectType()
export class List {
  @Field((type) => ID)
  readonly id: string;

  @Field()
  title: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  doneAt?: Date | null;

  @Field({ nullable: true })
  archivedAt?: Date | null;

  @Field((type) => [Todo])
  todos: [Todo];

  @Field((type) => User)
  owner: User;
}
