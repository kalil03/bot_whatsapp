import { Command, CommandContext } from '../../types/command';
import { calcExpression } from '../../utils/misc.util';

const CalcCommand: Command = {
  name: 'calc',
  execute: async (ctx: CommandContext) => {
    if (!ctx.args.length) {
      await ctx.message.reply(`🧮 Uso: ${ctx.prefix}calc expressão\nEx: ${ctx.prefix}calc 2+2\nEx: ${ctx.prefix}calc 10 cm em m`);
      return;
    }

    const query = ctx.args.join(' ');

    try {
      const result = await calcExpression(query);
      if (result === null) {
        await ctx.message.reply('❌ O resultado do cálculo retornou um valor inválido. Digite uma expressão correta.');
        return;
      }

      await ctx.message.reply(`🧮 *Calculadora*\n\nResultado: *${result}*`);
    } catch {
      await ctx.message.reply('❌ Ocorreu um erro no cálculo. A expressão é inválida.');
    }
  }
};

export default CalcCommand;
