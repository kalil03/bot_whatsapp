import { Command, CommandContext } from '../../types/command';
import { symbolsASCI } from '../../utils/misc.util';

const TabelaCommand: Command = {
  name: 'tabela',
  execute: async (ctx: CommandContext) => {
    try {
      const table = await symbolsASCI();
      await ctx.message.reply(`🔠 *Tabela de caracteres*\n\n${table}`);
    } catch {
      await ctx.message.reply('❌ Ocorreu um erro ao baixar a tabela.');
    }
  }
};

export default TabelaCommand;
