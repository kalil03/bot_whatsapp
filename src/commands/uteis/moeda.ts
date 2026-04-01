import { Command, CommandContext } from '../../types/command';
import { convertCurrency } from '../../utils/misc.util';

const MoedaCommand: Command = {
  name: 'moeda',
  execute: async (ctx: CommandContext) => {
    const supported = ['real', 'dolar', 'euro', 'iene'];

    if (ctx.args.length < 2 || isNaN(Number(ctx.args[1])) || !supported.includes(ctx.args[0].toLowerCase())) {
      await ctx.message.reply(`💱 Uso: ${ctx.prefix}moeda moeda valor\nMoedas aceitas: ${supported.join(', ')}\nEx: ${ctx.prefix}moeda dolar 20`);
      return;
    }

    const currency = ctx.args[0].toLowerCase() as 'dolar' | 'euro' | 'real' | 'iene';
    const value = Number(ctx.args[1]);

    try {
      const data = await convertCurrency(currency, value);
      
      let replyText = `💱 *Conversão de Moeda (${currency.charAt(0).toUpperCase() + currency.slice(1)})*\n`;
      replyText += `*Valor inserido*: ${value}\n\n`;

      data.convertion.forEach(c => {
        replyText += `--- *${c.currency}* ---\n`;
        replyText += `- *Nome*: ${c.convertion_name}\n`;
        replyText += `- *Valor*: ${c.value_converted_formatted}\n`;
        replyText += `- *Atualizado em*: ${c.updated}\n\n`;
      });

      await ctx.message.reply(replyText);
    } catch {
      await ctx.message.reply('❌ Ocorreu um erro ao buscar os dados da moeda. Tente novamente mais tarde.');
    }
  }
};

export default MoedaCommand;
