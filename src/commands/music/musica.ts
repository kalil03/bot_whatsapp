import { Command, CommandContext } from '../../types/command';
import { MusicService } from '../../services/music.service';
import { logger } from '../../app/logger';

const MusicaCommand: Command = {
  name: 'musica',
  execute: async (ctx: CommandContext) => {
    try {
      if (ctx.args.length === 0) {
        await ctx.client.sendMessage(ctx.message.from, `Uso: ${ctx.prefix}musica <nome da música>`);
        return;
      }

      const query = ctx.args.join(' ');
      const loadingMsg = await ctx.client.sendMessage(ctx.message.from, '🎵 Buscando no Spotify...');

      const result = await MusicService.searchTrack(query);

      if (!result) {
        await ctx.client.sendMessage(ctx.message.from, `Poxa, não encontrei nenhum resultado para "${query}" no Spotify. 😔`);
        return;
      }

      const replyText = `🎵 *Resultado encontrado*\n*Música:* ${result.name}\n*Artista:* ${result.artist}\n*Álbum:* ${result.album}\n*Spotify:* ${result.url}`;

      await ctx.client.sendMessage(ctx.message.from, replyText, {
        quotedMessageId: ctx.message.id._serialized
      });
    } catch (error) {
      logger.error({ err: error }, 'Erro no comando musica');
      await ctx.client.sendMessage(ctx.message.from, '❌ Erro interno ou API do Spotify não configurada.');
    }
  }
};

export default MusicaCommand;
