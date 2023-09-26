import { Todo } from './Todo';
import { CreateTodoInput, TodosArgs } from './TodoTypes';
import { prisma } from '../common';
import { Prisma } from '@prisma/client';
import { User } from '../users/User';
import { List } from '../lists/List';
import { IntegrationService } from '../integrations/IntegrationService';

export class TodoService {
  static async getOwnTodos(args: TodosArgs, userId: string): Promise<Todo[]> {
    const data: Prisma.TodoFindManyArgs = {
      skip: args.skip || 0,
      take: args.take || 20,
      where: {
        ownerId: userId,
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

    return prisma.todo.findMany(data);
  }

  static async createTodo(input: CreateTodoInput, userId: string) {
    const data: Prisma.TodoCreateInput = {
      title: input.title,
      dueDate: input.dueDate,
      owner: {
        connect: {
          id: userId,
        },
      },
    };

    if (input.listId) {
      data.list = { connect: { id: input.listId } };
    }

    const createdTodo = await prisma.todo.create({ data });

    // TODO: publish an event instead of blocking the request; handle it in a separate flow or service
    await IntegrationService.createTaskInExternalServices(createdTodo);

    return createdTodo;
  }

  static async updateTodo(id: string, data: CreateTodoInput, userId: string) {
    return prisma.todo.update({
      where: { id, ownerId: userId },
      data,
    });
  }

  static async toggleTodoCompletion(id: string, userId: string) {
    const todo = await prisma.todo.findUniqueOrThrow({
      where: { id, ownerId: userId },
    });

    const updatedTodo = await prisma.todo.update({
      where: { id, ownerId: userId },
      data: {
        completedAt: todo.completedAt ? null : new Date(),
      },
    });

    // TODO: publish an event instead of blocking the request; handle it in a separate flow or service
    await IntegrationService.toggleTaskCompletionInExternalServices(
      updatedTodo,
    );

    return updatedTodo;
  }

  static async deleteTodo(id: string, userId: string) {
    return prisma.todo.update({
      where: { id, ownerId: userId },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  static async getTodoOwner(id: string): Promise<User> {
    return prisma.todo
      .findUniqueOrThrow({
        where: {
          id,
        },
      })
      .owner();
  }

  static async getTodoList(todoId: string): Promise<List | null> {
    return prisma.todo
      .findUniqueOrThrow({
        where: {
          id: todoId,
        },
      })
      .list();
  }
}
