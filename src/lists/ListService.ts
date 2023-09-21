import { Context } from '../common';
import { User } from '../users/User';
import { List } from './List';
import { CreateListInput } from './ListTypes';

// TODO: use @Service instead of static classes methods
export class ListService {
  static async getOwnLists(ctx: Context): Promise<List[]> {
    return ctx.prisma.list.findMany({
      where: {
        ownerId: ctx.userId,
        deletedAt: null,
      },
      orderBy: { title: 'asc' },
    });
  }

  static async createList(input: CreateListInput, ctx: Context) {
    return ctx.prisma.list.create({
      data: {
        title: input.title,
        owner: {
          connect: {
            id: ctx.userId,
          },
        },
      },
    });
  }

  static async updateList(id: string, data: CreateListInput, ctx: Context) {
    return ctx.prisma.list.update({
      where: { id, ownerId: ctx.userId },
      data,
    });
  }

  static async getListOwner(listId: string, ctx: Context): Promise<User> {
    return ctx.prisma.list
      .findUniqueOrThrow({
        where: {
          id: listId,
        },
      })
      .owner();
  }
}
