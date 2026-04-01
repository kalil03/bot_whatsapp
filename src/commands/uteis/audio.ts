import { Command, CommandContext } from '../../types/command';
import { extractAudioFromVideo } from '../../utils/convert.util';
import { MessageMedia } from 'whatsapp-web.js';

const AudioCommand: Command = {
  name: 'audio',
  execute: async (ctx: CommandContext) => {
    let target = ctx.message;
    if (ctx.message.hasQuotedMsg) target = await ctx.message.getQuotedMessage();

    if (target.type !== 'video') {
      await ctx.message.reply(`🎬 Uso: Envie ou responda a um *vídeo* com ${ctx.prefix}audio`);
      return;
    }

    try {
      const media = await target.downloadMedia();
      const buffer = Buffer.from(media.data, 'base64');
      const audioBuffer = await extractAudioFromVideo('buffer', buffer);

      const replyMedia = new MessageMedia('audio/ogg', audioBuffer.toString('base64'));
      await ctx.message.reply(replyMedia, undefined, { sendAudioAsVoice: true });
    } catch {
      await ctx.message.reply('❌ Ocorreu um erro ao tentar extrair o áudio do vídeo.');
    }
  }
};

export default AudioCommand;
