import { Command, CommandContext } from '../../types/command';

const PingCommand: Command = {
  name: 'ping',
  execute: async (ctx: CommandContext) => {
    await ctx.message.reply('🏓 Pong!');
  }
};

export default PingCommand;
