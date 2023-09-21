import { prisma } from '../common';
import { List } from '../lists/List';

export class UserService {
  static async getUserLists(userId: string): Promise<List[]> {
    return prisma.user
      .findUniqueOrThrow({
        where: {
          id: userId,
        },
      })
      .lists();
  }
}
