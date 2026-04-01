import { Command, CommandContext } from '../../types/command';
import { aiService } from '../../services/ai.service';
import { PersonaMode } from '../../types/persona';
import { logger } from '../../app/logger';

const AiCommand: Command = {
  name: 'ia',
  execute: async (ctx: CommandContext) => {
    try {
      if (ctx.args.length === 0) {
        await ctx.client.sendMessage(ctx.message.from, `Uso: ${ctx.prefix}ia <pergunta>`);
        return;
      }

      const prompt = ctx.args.join(' ');
      const response = await aiService.askAI(prompt, PersonaMode.DEFAULT);
      await ctx.client.sendMessage(ctx.message.from, response);
    } catch (error) {
      logger.error({ err: error }, 'Erro no comando ia');
      await ctx.client.sendMessage(ctx.message.from, '❌ Ocorreu um erro ao gerar a resposta.');
    }
  }
};

export default AiCommand;
