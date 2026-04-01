import { Command, CommandContext } from '../../types/command';
import { moviedbTrendings } from '../../utils/misc.util';

const SeriesCommand: Command = {
  name: 'series',
  execute: async (ctx: CommandContext) => {
    try {
      const trends = await moviedbTrendings('tv');
      await ctx.message.reply(`📺 *Tendências de séries*\n\n${trends}`);
    } catch {
      await ctx.message.reply('❌ Erro de conexão com a API do TMDb.');
    }
  }
};

export default SeriesCommand;
