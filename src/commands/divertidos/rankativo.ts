import { Command, CommandContext } from '../../types/command';
import { db } from '../../db/client';
import { users } from '../../db/schema';
import { desc } from 'drizzle-orm';

const RankAtivoCommand: Command = {
  name: 'rankativo',
  execute: async (ctx: CommandContext) => {
    const list = await db.select()
      .from(users)
      .orderBy(desc(users.totalMessages))
      .limit(10);

    if (list.length === 0) {
      await ctx.message.reply('Nenhum dado encontrado para o ranking ativo.');
      return;
    }

    let replyText = `🏆 *Ranking de Atividade (Global)* 🏆\n\n`;
    let mentions: string[] = [];

    list.forEach((u, index) => {
      replyText += `${index + 1}º - @${u.id.split('@')[0]} (${u.totalMessages} msgs)\n`;
      mentions.push(u.id);
    });

    await ctx.message.reply(replyText, undefined, { mentions });
  }
};

export default RankAtivoCommand;
