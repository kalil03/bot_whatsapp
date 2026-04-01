import { Command, CommandContext } from '../../types/command';
import { aiService } from '../../services/ai.service';
import { PersonaMode } from '../../types/persona';
import { logger } from '../../app/logger';

const CoachCommand: Command = {
  name: 'coach',
  execute: async (ctx: CommandContext) => {
    try {
      if (ctx.args.length === 0) {
        await ctx.client.sendMessage(ctx.message.from, `Uso: ${ctx.prefix}coach <situação/problema>`);
        return;
      }

      const prompt = ctx.args.join(' ');
      const response = await aiService.askAI(prompt, PersonaMode.COACH);
      
      await ctx.client.sendMessage(ctx.message.from, response, {
        quotedMessageId: ctx.message.id._serialized
      });
    } catch (error) {
      logger.error({ err: error }, 'Erro no comando coach');
      await ctx.client.sendMessage(ctx.message.from, '❌ Faltou mindset. Tente novamente.');
    }
  }
};

export default CoachCommand;
