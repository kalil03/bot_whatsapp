import { Command, CommandContext } from '../../types/command';
import { infoDDD } from '../../utils/misc.util';

const DddCommand: Command = {
  name: 'ddd',
  execute: async (ctx: CommandContext) => {
    if (!ctx.args.length || isNaN(Number(ctx.args[0]))) {
      await ctx.message.reply(`📱 Uso: ${ctx.prefix}ddd numero\nEx: ${ctx.prefix}ddd 11`);
      return;
    }

    const ddd = ctx.args[0];

    try {
      const info = await infoDDD(ddd);
      if (!info) {
        await ctx.message.reply('❌ Número de DDD inválido ou não encontrado.');
        return;
      }

      await ctx.message.reply(`📱 *Informações DDD (${ddd})*\n\n*Estado*: ${info.state}\n*Região*: ${info.region}`);
    } catch {
      await ctx.message.reply('❌ Ocorreu um erro ao buscar as informações do DDD.');
    }
  }
};

export default DddCommand;
