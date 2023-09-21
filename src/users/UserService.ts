import { Context } from '../common';
import { List } from '../lists/List';

// TODO: use @Service instead of static classes methods
export class UserService {
  static async getUserLists(userId: string, ctx: Context): Promise<List[]> {
    return ctx.prisma.user
      .findUniqueOrThrow({
        where: {
          id: userId,
        },
      })
      .lists();
  }
}
