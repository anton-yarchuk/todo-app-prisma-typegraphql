import 'reflect-metadata';
import {
  Resolver,
  Ctx,
  FieldResolver,
  Root,
  Args,
  Mutation,
  Arg,
  Query,
} from 'type-graphql';
import { List } from './List';
import { Todo } from '../todos/Todo';
import { Context } from '../common';
import { User } from '../users/User';
import { TodoService } from '../todos/TodoService';
import { TodosArgs } from '../todos/TodoTypes';
import { ListService } from './ListService';
import { CreateListInput } from './ListTypes';

@Resolver(List)
export class ListResolver {
  /**
   * QUERIES
   */

  @Query((returns) => [List])
  async lists(@Ctx() ctx: Context) {
    return ListService.getOwnLists(ctx);
  }

  /**
   * MUTATIONS
   */

  @Mutation((returns) => List)
  async createList(@Arg('data') input: CreateListInput, @Ctx() ctx: Context) {
    return ListService.createList(input, ctx);
  }

  @Mutation((returns) => List)
  async updateList(
    @Arg('id') id: string,
    @Arg('data') data: CreateListInput,
    @Ctx() ctx: Context,
  ) {
    return ListService.updateList(id, data, ctx);
  }

  /**
   * FIELDS
   */

  @FieldResolver()
  async todos(
    @Root() list: List,
    @Args() args: TodosArgs,
    @Ctx() ctx: Context,
  ): Promise<Todo[]> {
    args.listId = list.id;

    return TodoService.getOwnTodos(args, ctx);
  }

  @FieldResolver()
  owner(@Root() list: List, @Ctx() ctx: Context): Promise<User> {
    return ListService.getListOwner(list.id, ctx);
  }
}
