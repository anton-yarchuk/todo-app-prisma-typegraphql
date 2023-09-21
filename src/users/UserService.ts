import { prisma } from '../common';
import { List } from '../lists/List';

// TODO: use @Service instead of static classes methods
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
