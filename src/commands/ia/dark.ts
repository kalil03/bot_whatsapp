import { Command, CommandContext } from '../../types/command';
import { aiService } from '../../services/ai.service';
import { PersonaMode } from '../../types/persona';
import { logger } from '../../app/logger';

const DarkCommand: Command = {
  name: 'dark',
  execute: async (ctx: CommandContext) => {
    try {
      if (ctx.args.length === 0) {
        await ctx.client.sendMessage(ctx.message.from, `Uso: ${ctx.prefix}dark <pergunta/assunto>`);
        return;
      }

      const prompt = ctx.args.join(' ');
      const response = await aiService.askAI(prompt, PersonaMode.DARK);
      
      await ctx.client.sendMessage(ctx.message.from, response, {
        quotedMessageId: ctx.message.id._serialized
      });
    } catch (error) {
      logger.error({ err: error }, 'Erro no comando dark');
      await ctx.client.sendMessage(ctx.message.from, '❌ As trevas não responderam desta vez.');
    }
  }
};

export default DarkCommand;
