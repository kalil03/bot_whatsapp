import { db } from '../db/client';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export class DatabaseService {
  static async incrementUserMessage(userId: string) {
    const existingUser = await db.select().from(users).where(eq(users.id, userId)).get();

    if (existingUser) {
      await db.update(users)
        .set({ totalMessages: existingUser.totalMessages + 1 })
        .where(eq(users.id, userId));
    } else {
      await db.insert(users).values({ id: userId, totalMessages: 1 });
    }
  }

  static async getUserMessages(userId: string) {
    const user = await db.select().from(users).where(eq(users.id, userId)).get();
    return user?.totalMessages || 0;
  }
}
