import { Command, CommandContext } from '../../types/command';
import { musicRecognition } from '../../utils/audio.util';

const QualmusicaCommand: Command = {
  name: 'qualmusica',
  execute: async (ctx: CommandContext) => {
    let target = ctx.message;
    if (ctx.message.hasQuotedMsg) {
      target = await ctx.message.getQuotedMessage();
    }

    if (!target.hasMedia) {
      await ctx.message.reply(`💿 Uso: Envie ou responda a um áudio/vídeo com ${ctx.prefix}qualmusica`);
      return;
    }

    await ctx.message.reply('⏳ Em andamento, estou procurando sua música...');

    try {
      const media = await target.downloadMedia();
      const buffer = Buffer.from(media.data, 'base64');
      const result = await musicRecognition(buffer, target.type);

      if (!result) {
        await ctx.message.reply('❌ Nenhuma música compatível foi encontrada.');
        return;
      }

      const txt = `💿 *Reconhecimento de música*\n\n*Título*: ${result.title}\n*Produtora*: ${result.producer}\n*Duração*: ${result.duration}\n*Lançamento*: ${result.release_date}\n*Album*: ${result.album}\n*Artistas*: ${result.artists}\n`;
      await ctx.message.reply(txt);
    } catch {
      await ctx.message.reply('❌ Ocorreu um erro ao reconhecer a música. Verifique se o áudio tem qualidade razoável e se não excedemos os limites da API.');
    }
  }
};

export default QualmusicaCommand;
