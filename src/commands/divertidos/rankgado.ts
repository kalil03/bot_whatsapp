import { Command, CommandContext } from '../../types/command';
import { RankingService } from '../../services/ranking.service';

const RankGadoCommand: Command = {
  name: 'rankgado',
  execute: async (ctx: CommandContext) => {
    const chat = await ctx.message.getChat();
    
    if (!chat.isGroup) {
      await ctx.message.reply('Este comando só pode ser usado em grupos.');
      return;
    }

    const ranking = await RankingService.getRanking(chat.id._serialized, 'gado', 10);

    if (ranking.length === 0) {
      await ctx.message.reply('Ainda não há dados para o ranking de gados neste grupo! Usem o comando !gado.');
      return;
    }

    let replyText = `🐄 *Top Gados do Grupo* 🐄\n\n`;
    let mentions: string[] = [];

    ranking.forEach((r, index) => {
      replyText += `${index + 1}º - @${r.userId.split('@')[0]} (${r.points} pts)\n`;
      mentions.push(r.userId);
    });

    await ctx.message.reply(replyText, undefined, { mentions });
  }
};

export default RankGadoCommand;
