import 'reflect-metadata';
import { ObjectType, Field, ID } from 'type-graphql';
import { User } from '../users/User';
import { Todo } from '../todos/Todo';
import { Length } from 'class-validator';

@ObjectType()
export class List {
  @Field((type) => ID)
  readonly id: string;

  @Field()
  @Length(1, 50)
  title: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  deletedAt?: Date | null;

  @Field((type) => [Todo], { nullable: true })
  todos?: [Todo];

  @Field((type) => User)
  owner?: User;
}
