import { Command, CommandContext } from '../../types/command';
import { musicLyrics } from '../../utils/misc.util';
import { MessageMedia } from 'whatsapp-web.js';

const LetraCommand: Command = {
  name: 'letra',
  execute: async (ctx: CommandContext) => {
    if (!ctx.args.length) {
      await ctx.message.reply(`🎵 Uso: ${ctx.prefix}letra nome da musica\nEx: ${ctx.prefix}letra shape of you`);
      return;
    }

    const query = ctx.args.join(' ');
    await ctx.message.reply('🔍 Pesquisando letra...');

    try {
      const result = await musicLyrics(query);
      if (!result) {
        await ctx.message.reply('❌ Nenhuma letra encontrada. Tente com outro nome.');
        return;
      }

      const replyText = `🎵 *Letra de Música*\n\n*Música*: ${result.title}\n*Artista*: ${result.artist}\n\n${result.lyrics}`;
      const hasLargeText = replyText.length > 50000;
      if (hasLargeText) {
        await ctx.message.reply('❌ A letra excedeu o tamanho máximo.');
        return;
      }

      if (result.image) {
        const media = await MessageMedia.fromUrl(result.image, { unsafeMime: true });
        await ctx.client.sendMessage(ctx.message.from, media, { caption: replyText, quotedMessageId: ctx.message.id._serialized });
      } else {
        await ctx.message.reply(replyText);
      }
    } catch {
      await ctx.message.reply('❌ Hubo um erro ao buscar a letra na API.');
    }
  }
};

export default LetraCommand;
