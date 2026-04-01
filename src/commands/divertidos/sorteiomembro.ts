import { Command, CommandContext } from '../../types/command';
import { GroupChat } from 'whatsapp-web.js';

const SorteiomembroCommand: Command = {
  name: 'sorteiomembro',
  execute: async (ctx: CommandContext) => {
    const chat = await ctx.message.getChat();
    if (!chat.isGroup) {
      await ctx.message.reply('❌ Este comando só pode ser usado em grupos.');
      return;
    }

    const groupChat = chat as GroupChat;
    const participants = groupChat.participants.map(p => p.id._serialized);
    
    if (!participants.length) {
      await ctx.message.reply('❌ Não foi possível obter os participantes.');
      return;
    }

    const randomParticipant = participants[Math.floor(Math.random() * participants.length)];
    const number = randomParticipant.split('@')[0];

    const replyText = `🎲 *Sorteio (Membro)*: \n\nO membro sorteado foi @${number}`;
    
    await ctx.message.reply(replyText, undefined, {
      mentions: [randomParticipant]
    });
  }
};

export default SorteiomembroCommand;
