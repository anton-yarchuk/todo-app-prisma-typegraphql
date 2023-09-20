import 'reflect-metadata';
import { ObjectType, Field, ID } from 'type-graphql';
import { List } from '../lists/List';
import { User } from '../user/User';

@ObjectType()
export class Todo {
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

  @Field((type) => List)
  list: List;

  @Field((type) => User)
  owner: User;
}