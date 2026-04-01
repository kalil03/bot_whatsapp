import { Command, CommandContext } from '../../types/command';

const PptCommand: Command = {
  name: 'ppt',
  execute: async (ctx: CommandContext) => {
    const validChoices = ["pedra", "papel", "tesoura"];
    const userChoice = ctx.args[0]?.toLowerCase();

    if (!ctx.args.length || !validChoices.includes(userChoice)) {
      await ctx.message.reply(`✊✋✌️ Uso: ${ctx.prefix}ppt pedra|papel|tesoura`);
      return;
    }

    const randomIndex = Math.floor(Math.random() * validChoices.length);
    const botChoice = validChoices[randomIndex];

    const botIcon = botChoice === 'pedra' ? '✊' : botChoice === 'papel' ? '✋' : '✌️';
    const userIcon = userChoice === 'pedra' ? '✊' : userChoice === 'papel' ? '✋' : '✌️';

    const isVict = (userChoice === 'pedra' && botChoice === 'tesoura') ||
                 (userChoice === 'papel' && botChoice === 'pedra') ||
                 (userChoice === 'tesoura' && botChoice === 'papel');
                 
    const isDraw = userChoice === botChoice;

    const replyText = isDraw ? `😐 *Empate!*\n\nVocê escolheu ${userIcon} e o bot escolheu ${botIcon}\n` 
                  : isVict ? `😁 *Vitória!*\n\nVocê escolheu ${userIcon} e o bot escolheu ${botIcon}\n`
                  : `😭 *Derrota!*\n\nVocê escolheu ${userIcon} e o bot escolheu ${botIcon}\n`;

    await ctx.message.reply(replyText);
  }
};

export default PptCommand;
