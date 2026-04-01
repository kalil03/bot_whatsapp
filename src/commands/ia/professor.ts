import { Command, CommandContext } from '../../types/command';
import { aiService } from '../../services/ai.service';
import { PersonaMode } from '../../types/persona';
import { logger } from '../../app/logger';

const ProfessorCommand: Command = {
  name: 'professor',
  execute: async (ctx: CommandContext) => {
    try {
      if (ctx.args.length === 0) {
        await ctx.client.sendMessage(ctx.message.from, `Uso: ${ctx.prefix}professor <assunto/dúvida>`);
        return;
      }

      const prompt = ctx.args.join(' ');
      const response = await aiService.askAI(prompt, PersonaMode.PROFESSOR);
      
      await ctx.client.sendMessage(ctx.message.from, response, {
        quotedMessageId: ctx.message.id._serialized
      });
    } catch (error) {
      logger.error({ err: error }, 'Erro no comando professor');
      await ctx.client.sendMessage(ctx.message.from, '❌ O professor se perdeu na explicação.');
    }
  }
};

export default ProfessorCommand;
