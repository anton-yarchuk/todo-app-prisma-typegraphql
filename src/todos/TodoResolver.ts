import 'reflect-metadata';
import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Args,
  Ctx,
  FieldResolver,
  Root,
} from 'type-graphql';
import { Todo } from './Todo';
import { User } from '../users/User';
import { List } from '../lists/List';
import { Context } from '../common';
import { TodosArgs, CreateTodoInput } from './TodoTypes';
import { TodoService } from './TodoService';

@Resolver(Todo)
export class TodoResolver {
  /**
   * QUERIES
   */

  @Query((returns) => [Todo])
  async todos(@Args() args: TodosArgs, @Ctx() ctx: Context) {
    return TodoService.getOwnTodos(args, ctx.userId);
  }

  /**
   * MUTATIONS
   */

  @Mutation((returns) => Todo)
  async createTodo(@Arg('data') input: CreateTodoInput, @Ctx() ctx: Context) {
    return TodoService.createTodo(input, ctx.userId);
  }

  @Mutation((returns) => Todo)
  async updateTodo(
    @Arg('id') id: string,
    @Arg('data') data: CreateTodoInput,
    @Ctx() ctx: Context,
  ) {
    return TodoService.updateTodo(id, data, ctx.userId);
  }

  @Mutation((returns) => Todo)
  async toggleTodoCompletion(@Arg('id') id: string, @Ctx() ctx: Context) {
    return TodoService.toggleTodoCompletion(id, ctx.userId);
  }

  @Mutation((returns) => Todo)
  async deleteTodo(@Arg('id') id: string, @Ctx() ctx: Context) {
    return TodoService.deleteTodo(id, ctx.userId);
  }

  /**
   * FIELDS
   */

  @FieldResolver()
  owner(@Root() todo: Todo, @Ctx() ctx: Context): Promise<User> {
    return TodoService.getTodoOwner(todo.id);
  }

  @FieldResolver()
  list(@Root() todo: Todo, @Ctx() ctx: Context): Promise<List | null> {
    return TodoService.getTodoList(todo.id);
  }
}
