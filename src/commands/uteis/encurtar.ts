import { Command, CommandContext } from '../../types/command';
import { shortenUrl } from '../../utils/misc.util';

const EncurtarCommand: Command = {
  name: 'encurtar',
  execute: async (ctx: CommandContext) => {
    if (!ctx.args.length) {
      await ctx.message.reply(`✂️ Uso: ${ctx.prefix}encurtar link\nEx: ${ctx.prefix}encurtar https://google.com/`);
      return;
    }

    const url = ctx.args[0];
    const shortened = await shortenUrl(url);

    if (!shortened) {
      await ctx.message.reply('❌ Não foi possível encurtar este link. Verifique se a URL é válida.');
      return;
    }

    await ctx.message.reply(`✂️ *Encurtador de link*\n\n*Link*: ${shortened}`);
  }
};

export default EncurtarCommand;
