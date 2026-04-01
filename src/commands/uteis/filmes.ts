import { Command, CommandContext } from '../../types/command';
import { moviedbTrendings } from '../../utils/misc.util';

const FilmesCommand: Command = {
  name: 'filmes',
  execute: async (ctx: CommandContext) => {
    try {
      const trends = await moviedbTrendings('movie');
      await ctx.message.reply(`🎬 *Tendências de filmes*\n\n${trends}`);
    } catch {
      await ctx.message.reply('❌ Erro de conexão com a API do TMDb.');
    }
  }
};

export default FilmesCommand;
