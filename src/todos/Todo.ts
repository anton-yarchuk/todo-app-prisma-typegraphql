import 'reflect-metadata';
import { ObjectType, Field, ID } from 'type-graphql';
import { List } from '../lists/List';
import { User } from '../users/User';
import { Length } from 'class-validator';

@ObjectType()
export class Todo {
  @Field((type) => ID)
  readonly id: string;

  @Field()
  @Length(1, 100)
  title: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  dueDate?: Date | null;

  @Field({ nullable: true })
  completedAt?: Date | null;

  @Field({ nullable: true })
  deletedAt?: Date | null;

  @Field((type) => List, { nullable: true })
  list?: List | null;

  @Field((type) => User)
  owner?: User;

  // no @Field decorator, field is not accessible via API calls
  ownerId: string;
}
