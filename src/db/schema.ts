import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  totalMessages: integer('total_messages').default(0).notNull(),
});

export const rankings = sqliteTable('rankings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  groupId: text('group_id').notNull(),
  userId: text('user_id').notNull(),
  category: text('category').notNull(),
  points: integer('points').default(0).notNull(),
});

export const sessions = sqliteTable('sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  groupId: text('group_id').notNull(),
  userId: text('user_id').notNull(),
  blockedUntil: integer('blocked_until'),
});
