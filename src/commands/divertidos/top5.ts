import { Command, CommandContext } from '../../types/command';
import { GroupChat } from 'whatsapp-web.js';

const Top5Command: Command = {
  name: 'top5',
  execute: async (ctx: CommandContext) => {
    const chat = await ctx.message.getChat();
    if (!chat.isGroup) {
      await ctx.message.reply('❌ Este comando só pode ser usado em grupos.');
      return;
    }

    if (!ctx.args.length) {
      await ctx.message.reply(`🏅 Uso: ${ctx.prefix}top5 tema\nEx: ${ctx.prefix}top5 mais cornos`);
      return;
    }

    const theme = ctx.args.join(' ');
    const groupChat = chat as GroupChat;
    let participants = groupChat.participants.map(p => p.id._serialized);

    if (participants.length < 5) {
      await ctx.message.reply('❌ O grupo deve ter no mínimo 5 membros para usar este comando.');
      return;
    }

    let replyText = `🏆 *TOP 5 ${theme}*\n\n`;
    const mentionList: string[] = [];

    for (let i = 1; i <= 5; i++) {
      const idx = Math.floor(Math.random() * participants.length);
      const chosen = participants[idx];
      participants.splice(idx, 1);
      
      const num = chosen.split('@')[0];
      const icon = i === 1 ? '🥇' : i === 2 ? '🥈' : i === 3 ? '🥉' : '';
      
      replyText += `${icon} ${i}° Lugar - @${num}\n`;
      mentionList.push(chosen);
    }

    await ctx.message.reply(replyText, undefined, {
      mentions: mentionList
    });
  }
};

export default Top5Command;
