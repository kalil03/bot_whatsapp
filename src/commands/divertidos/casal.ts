import { Command, CommandContext } from '../../types/command';
import { GroupChat } from 'whatsapp-web.js';

const CasalCommand: Command = {
  name: 'casal',
  execute: async (ctx: CommandContext) => {
    const chat = await ctx.message.getChat();
    if (!chat.isGroup) {
      await ctx.message.reply('❌ Este comando só pode ser usado em grupos.');
      return;
    }

    const groupChat = chat as GroupChat;
    let participants = groupChat.participants.map(p => p.id._serialized);
    
    if (participants.length < 2) {
      await ctx.message.reply('❌ Este comando precisa de no mínimo 2 membros no grupo.');
      return;
    }

    const idx1 = Math.floor(Math.random() * participants.length);
    const p1 = participants[idx1];
    participants.splice(idx1, 1);
    
    const idx2 = Math.floor(Math.random() * participants.length);
    const p2 = participants[idx2];

    const num1 = p1.split('@')[0];
    const num2 = p2.split('@')[0];

    const replyText = `👩‍❤️‍👨 *Casal*\n\n💕 Está rolando um clima entre @${num1} e @${num2}`;
    
    await ctx.message.reply(replyText, undefined, {
      mentions: [p1, p2]
    });
  }
};

export default CasalCommand;
