import { Command, CommandContext } from '../../types/command';

const SorteioCommand: Command = {
  name: 'sorteio',
  execute: async (ctx: CommandContext) => {
    if (!ctx.args.length) {
      await ctx.message.reply(`🎲 Uso: ${ctx.prefix}sorteio número\nEx: ${ctx.prefix}sorteio 100 - Sorteia um número de 1 a 100.`);
      return;
    }

    const chosenNumber = Number(ctx.args[0]);
    if (isNaN(chosenNumber) || chosenNumber <= 1) {
      await ctx.message.reply('❌ O valor inserido é inválido, escolha um número maior que 1.');
      return;
    }
    
    const randomNumber = Math.floor(Math.random() * chosenNumber) + 1;
    await ctx.message.reply(`🎲 *Sorteio (Número)*: \n\nO número sorteado foi *${randomNumber}*`);
  }
};

export default SorteioCommand;
