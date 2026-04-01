import { Command, CommandContext } from '../../types/command';
import { getMentionedUsers } from '../../utils/mentions';
import { resolveUserId } from '../../utils/helpers';

const BafometroCommand: Command = {
  name: 'bafometro',
  execute: async (ctx: CommandContext) => {
    const chat = await ctx.message.getChat();
    if (!chat.isGroup) {
      await ctx.message.reply('❌ Este comando só pode ser usado em grupos.');
      return;
    }

    const mentions = await getMentionedUsers(ctx.message);
    if (!ctx.message.hasQuotedMsg && !mentions.length) {
      await ctx.message.reply(`🍺 Uso: ${ctx.prefix}bafometro @membro ou responda a mensagem de alguém.`);
      return;
    }

    if (mentions.length > 1) {
      await ctx.message.reply('❌ Apenas um membro deve ser marcado por vez.');
      return;
    }

    let targetUser: string | undefined;

    if (ctx.message.hasQuotedMsg) {
      const quoted = await ctx.message.getQuotedMessage();
      targetUser = quoted.author || quoted.from;
    } else {
      targetUser = resolveUserId(ctx.args, mentions) || undefined;
    }

    if (!targetUser) {
      await ctx.message.reply('❌ Não foi possível identificar o membro.');
      return;
    }

    const randomPercent = Math.floor(Math.random() * 101);
    const replyText = `🍺 *Bafômetro*\n\nFoi detectado um nível de álcool de *${randomPercent}%*`;
    const quotedId = ctx.message.hasQuotedMsg ? (await ctx.message.getQuotedMessage()).id._serialized : ctx.message.id._serialized;

    await ctx.client.sendMessage(ctx.message.from, replyText, {
      quotedMessageId: quotedId
    });
  }
};

export default BafometroCommand;
