import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: {
      id: process.env.MOCK_USER_ID,
      name: 'First user',
      lists: {
        create: {
          title: 'First list',
          todos: {
            create: {
              title: 'First todo, attached to the first list',
              ownerUserId: process.env.MOCK_USER_ID,
            },
          },
        },
      },
      todos: {
        createMany: {
          data: [
            {
              title: 'Second todo, not attached to a list',
            },
            {
              title: 'Third todo, a completed one',
              completedAt: new Date(),
            },
            {
              title: 'Forth todo, a deleted one',
              deletedAt: new Date(),
            },
          ],
        },
      },
    },
  });

  await prisma.user.create({
    data: {
      name: 'Second user, invisible in dev',
      lists: {
        create: {
          title: 'Invisible list of invisible user',
        },
      },
      todos: {
        create: {
          title: 'Invisible todo of invisible user',
        },
      },
    },
  });
}

main()
  .then(async () => {
    console.log('DB seeding is done');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
