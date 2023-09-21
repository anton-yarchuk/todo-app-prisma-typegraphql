import { Todo } from './Todo';
import { CreateTodoInput, TodosArgs } from './TodoTypes';
import { Context } from '../common';
import { Prisma } from '@prisma/client';
import { User } from '../users/User';
import { List } from '../lists/List';

// TODO: use @Service instead of static classes methods
export class TodoService {
  static async getOwnTodos(args: TodosArgs, ctx: Context): Promise<Todo[]> {
    console.log(args.listId);
    const data: Prisma.TodoFindManyArgs = {
      skip: args.skip,
      take: args.take,
      where: {
        ownerId: ctx.userId,
        completedAt: args.includeCompleted ? undefined : null,
        listId: args.listId,
        deletedAt: null,
        title: args.titleContains
          ? { contains: args.titleContains }
          : undefined,
      },
      // TODO: allow custom ordering
      orderBy: { dueDate: { sort: 'asc', nulls: 'last' } },
    };

    return ctx.prisma.todo.findMany(data);
  }

  static async createTodo(input: CreateTodoInput, ctx: Context) {
    const data: Prisma.TodoCreateInput = {
      title: input.title,
      dueDate: input.dueDate,
      owner: {
        connect: {
          id: ctx.userId,
        },
      },
    };

    if (input.listId) {
      data.list = { connect: { id: input.listId } };
    }

    return ctx.prisma.todo.create({ data });
  }

  static async updateTodo(id: string, data: CreateTodoInput, ctx: Context) {
    return ctx.prisma.todo.update({
      where: { id, ownerId: ctx.userId },
      data,
    });
  }

  static async toggleTodoCompletion(id: string, ctx: Context) {
    const todo = await ctx.prisma.todo.findUniqueOrThrow({
      where: { id, ownerId: ctx.userId },
    });

    return ctx.prisma.todo.update({
      where: { id, ownerId: ctx.userId },
      data: {
        completedAt: todo.completedAt ? null : new Date(),
      },
    });
  }

  static async deleteTodo(id: string, ctx: Context) {
    return ctx.prisma.todo.update({
      where: { id, ownerId: ctx.userId },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  static async getTodoOwner(id: string, ctx: Context): Promise<User> {
    return ctx.prisma.todo
      .findUniqueOrThrow({
        where: {
          id,
        },
      })
      .owner();
  }

  static async getTodoList(todoId: string, ctx: Context): Promise<List | null> {
    return ctx.prisma.todo
      .findUniqueOrThrow({
        where: {
          id: todoId,
        },
      })
      .list();
  }
}
