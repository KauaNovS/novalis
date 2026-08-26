import { prisma } from '@/lib/prisma';

export async function createNotification(userId: string, title: string, message: string) {
  await prisma.notification.create({
    data: { userId, title, message },
  });
}

export async function notifyAllUsers(title: string, message: string) {
  const users = await prisma.user.findMany({ select: { id: true } });
  for (const user of users) {
    await createNotification(user.id, title, message);
  }
}
