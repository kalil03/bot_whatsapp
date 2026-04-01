import { Command, CommandContext } from '../../types/command';

const CaracoroaCommand: Command = {
  name: 'caracoroa',
  execute: async (ctx: CommandContext) => {
    const coinSides = ['cara', 'coroa'];
    const userChoice = ctx.args[0]?.toLowerCase();

    if (!ctx.args.length || !coinSides.includes(userChoice)) {
      await ctx.message.reply(`🪙 Uso: ${ctx.prefix}caracoroa cara|coroa`);
      return;
    }

    const chosenSide = coinSides[Math.floor(Math.random() * coinSides.length)];
    await ctx.message.reply("🪙 Lançando a moeda...");

    const isVictory = chosenSide === userChoice;
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    const resultText = isVictory 
      ? `😁 *Vitória!*\n\nO resultado caiu *${capitalize(chosenSide)}*\n`
      : `😭 *Derrota!*\n\nO resultado caiu *${capitalize(chosenSide)}*\n`;

    await ctx.message.reply(resultText);
  }
};

export default CaracoroaCommand;
