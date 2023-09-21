import { prisma } from '../common';
import { User } from '../users/User';
import { List } from './List';
import { CreateListInput } from './ListTypes';

export class ListService {
  static async getOwnLists(userId: string): Promise<List[]> {
    return prisma.list.findMany({
      where: {
        ownerId: userId,
        deletedAt: null,
      },
      orderBy: { title: 'asc' },
    });
  }

  static async createList(input: CreateListInput, userId: string) {
    return prisma.list.create({
      data: {
        title: input.title,
        owner: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  static async updateList(id: string, data: CreateListInput, userId: string) {
    return prisma.list.update({
      where: { id, ownerId: userId },
      data,
    });
  }

  static async getListOwner(listId: string): Promise<User> {
    return prisma.list
      .findUniqueOrThrow({
        where: {
          id: listId,
        },
      })
      .owner();
  }
}
