import 'reflect-metadata';
import { Resolver, Ctx, FieldResolver, Root, Args } from 'type-graphql';
import { Todo } from '../todos/Todo';
import { Context } from '../common';
import { User } from './User';
import { List } from '../lists/List';
import { TodosArgs } from '../todos/TodoTypes';
import { TodoService } from '../todos/TodoService';
import { UserService } from './UserService';

@Resolver(User)
export class UserResolver {
  /**
   * FIELDS
   */

  @FieldResolver()
  todos(
    @Root() user: User,
    @Args() args: TodosArgs,
    @Ctx() ctx: Context,
  ): Promise<Todo[]> {
    // ignoring root user since getOwnTodos are forcing userId based on the context
    return TodoService.getOwnTodos(args, ctx.userId);
  }

  @FieldResolver()
  lists(@Root() user: User, @Ctx() ctx: Context): Promise<List[]> {
    return UserService.getUserLists(user.id);
  }
}
