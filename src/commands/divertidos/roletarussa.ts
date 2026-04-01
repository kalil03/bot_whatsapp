import { Command, CommandContext } from '../../types/command';

const RoletarussaCommand: Command = {
  name: 'roletarussa',
  execute: async (ctx: CommandContext) => {
    const bulletPosition = Math.floor(Math.random() * 6) + 1;
    const currentPosition = Math.floor(Math.random() * 6) + 1;
    const hasShooted = (bulletPosition === currentPosition);

    const replyText = hasShooted 
      ? '🔫 *Roleta russa*\n\n💀 A arma disparou, você morreu.'
      : '🔫 *Roleta russa*\n\n😁 A arma não disparou, você sobreviveu a roleta russa.';

    await ctx.message.reply(replyText);
  }
};

export default RoletarussaCommand;
