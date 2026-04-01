import { Command, CommandContext } from '../../types/command';
import { getMentionedUsers } from '../../utils/mentions';

const ParCommand: Command = {
  name: 'par',
  execute: async (ctx: CommandContext) => {
    const chat = await ctx.message.getChat();
    if (!chat.isGroup) {
      await ctx.message.reply('❌ Este comando só pode ser usado em grupos.');
      return;
    }

    const mentions = await getMentionedUsers(ctx.message);
    if (mentions.length !== 2) {
      await ctx.message.reply(`👫 Uso: ${ctx.prefix}par @membro1 @membro2\nMede a compatibilidade de duas pessoas.`);
      return;
    }

    const percent = Math.floor(Math.random() * 101);
    const num1 = mentions[0].split('@')[0];
    const num2 = mentions[1].split('@')[0];

    const replyText = `👩‍❤️‍👨 *Par*\n\nA chance de compatibilidade entre @${num1} e @${num2} é de *${percent}%*`;

    await ctx.message.reply(replyText, undefined, {
      mentions: mentions
    });
  }
};

export default ParCommand;
