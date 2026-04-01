import { Command, CommandContext } from '../../types/command';
import { audioModified, AudioModificationType } from '../../utils/audio.util';
import { MessageMedia } from 'whatsapp-web.js';

const EfeitoaudioCommand: Command = {
  name: 'efeitoaudio',
  execute: async (ctx: CommandContext) => {
    const supported = ['estourar', 'x2', 'reverso', 'grave', 'agudo', 'volume'];
    const effect = ctx.args[0]?.toLowerCase();

    if (!ctx.message.hasQuotedMsg || !supported.includes(effect)) {
      await ctx.message.reply(`🔊 Uso: Responda a um áudio com:\n${supported.map(s => `- ${ctx.prefix}efeitoaudio ${s}`).join('\n')}`);
      return;
    }

    const quoted = await ctx.message.getQuotedMessage();
    if (!quoted.hasMedia || (quoted.type !== 'audio' && quoted.type !== 'ptt')) {
      await ctx.message.reply('❌ O comando suporta apenas *ÁUDIOS* ou *MENSAGENS DE VOZ*.');
      return;
    }

    try {
      const media = await quoted.downloadMedia();
      const buffer = Buffer.from(media.data, 'base64');
      const modified = await audioModified(buffer, effect as AudioModificationType);

      const replyMedia = new MessageMedia('audio/ogg', modified.toString('base64'));
      await ctx.message.reply(replyMedia, undefined, { sendAudioAsVoice: true });
    } catch {
      await ctx.message.reply('❌ Houve um erro na conversão de áudio.');
    }
  }
};

export default EfeitoaudioCommand;
