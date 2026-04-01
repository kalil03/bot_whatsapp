import { Command, CommandContext } from '../../types/command';
import { audioTranscription } from '../../utils/audio.util';

const OuvirCommand: Command = {
  name: 'ouvir',
  execute: async (ctx: CommandContext) => {
    if (!ctx.message.hasQuotedMsg) {
      await ctx.message.reply(`🔤 Uso: Responda a um áudio com ${ctx.prefix}ouvir`);
      return;
    }

    const quoted = await ctx.message.getQuotedMessage();
    if (!quoted.hasMedia) {
      await ctx.message.reply('❌ A mensagem marcada não contém mídia.');
      return;
    }

    const media = await quoted.downloadMedia();
    if (!media.mimetype.includes('audio')) {
      await ctx.message.reply('❌ O comando só funciona com áudio.');
      return;
    }

    if (quoted.duration && Number(quoted.duration) > 90) {
      await ctx.message.reply('❌ O áudio ultrapassa o limite de *1m30s*.');
      return;
    }

    try {
      const buffer = Buffer.from(media.data, 'base64');
      const text = await audioTranscription(buffer);
      await ctx.message.reply(`🔤 *Transcrição de áudio*\n\n*Texto*: ${text}`, undefined, { quotedMessageId: quoted.id._serialized });
    } catch {
      await ctx.message.reply('❌ Houve um erro na transcrição.');
    }
  }
};

export default OuvirCommand;
