import { Command, CommandContext } from '../../types/command';
import { getMentionedUsers } from '../../utils/mentions';
import { resolveUserId } from '../../utils/helpers';
import { RankingService } from '../../services/ranking.service';

const CornoCommand: Command = {
  name: 'corno',
  execute: async (ctx: CommandContext) => {
    const mentions = await getMentionedUsers(ctx.message);
    let targetUser = ctx.message.author || ctx.message.from;
    
    const parsedTarget = resolveUserId(ctx.args, mentions);
    if (parsedTarget) targetUser = parsedTarget;

    const randomPercent = Math.floor(Math.random() * 101);
    const replyText = `🦌 Medidor de Corno 🦌\n\n@${targetUser.split('@')[0]} é *${randomPercent}%* corno(a)! 🐃`;

    const chat = await ctx.message.getChat();
    if (chat.isGroup) {
      await RankingService.addPoints(chat.id._serialized, targetUser, 'corno', randomPercent);
    }

    await ctx.message.reply(replyText, undefined, {
      mentions: [targetUser]
    });
  }
};

export default CornoCommand;
