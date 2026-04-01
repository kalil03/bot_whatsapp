import { db } from '../db/client';
import { sessions } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export class GameService {
  static async blockUser(groupId: string, userId: string, durationMs: number) {
    const blockedUntil = Date.now() + durationMs;
    const existing = await db.select().from(sessions)
      .where(and(eq(sessions.groupId, groupId), eq(sessions.userId, userId))).get();

    if (existing) {
      await db.update(sessions)
        .set({ blockedUntil })
        .where(eq(sessions.id, existing.id));
    } else {
      await db.insert(sessions).values({ groupId, userId, blockedUntil });
    }
  }

  static async getRemainingBlock(groupId: string, userId: string): Promise<number> {
    const existing = await db.select().from(sessions)
      .where(and(eq(sessions.groupId, groupId), eq(sessions.userId, userId))).get();

    if (!existing || !existing.blockedUntil) return 0;
    
    const remaining = existing.blockedUntil - Date.now();
    return remaining > 0 ? remaining : 0;
  }
}
