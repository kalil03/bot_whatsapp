import { db } from '../db/client';
import { rankings } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';

export class RankingService {
  static async addPoints(groupId: string, userId: string, category: string, amount: number = 1) {
    const existing = await db.select().from(rankings)
      .where(and(
        eq(rankings.groupId, groupId),
        eq(rankings.userId, userId),
        eq(rankings.category, category)
      )).get();

    if (existing) {
      await db.update(rankings)
        .set({ points: existing.points + amount })
        .where(eq(rankings.id, existing.id));
    } else {
      await db.insert(rankings).values({
        groupId,
        userId,
        category,
        points: amount
      });
    }
  }

  static async getRanking(groupId: string, category: string, limit: number = 10) {
    return db.select()
      .from(rankings)
      .where(and(
        eq(rankings.groupId, groupId),
        eq(rankings.category, category)
      ))
      .orderBy(desc(rankings.points))
      .limit(limit);
  }
}
