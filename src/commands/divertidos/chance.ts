import { Command, CommandContext } from '../../types/command';

const ChanceCommand: Command = {
  name: 'chance',
  execute: async (ctx: CommandContext) => {
    if (!ctx.args.length) {
      await ctx.message.reply(`📊 Uso: ${ctx.prefix}chance tema\nEx: ${ctx.prefix}chance ficar rico`);
      return;
    }

    const theme = ctx.args.join(' ');
    const percentage = Math.floor(Math.random() * 101);

    const replyText = `📊 *Chance*\n\nVocê tem *${percentage}%* de chance de *${theme}*`;

    await ctx.message.reply(replyText);
  }
};

export default ChanceCommand;
