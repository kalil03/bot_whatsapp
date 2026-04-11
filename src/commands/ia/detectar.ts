import { Command, CommandContext } from '../../types/command';
import { aiService } from '../../services/ai.service';
import { PersonaMode } from '../../types/persona';
import { logger } from '../../app/logger';

const DetectarCommand: Command = {
  name: 'detectar',
  execute: async (ctx: CommandContext) => {
    try {
      if (ctx.args.length === 0) {
        await ctx.client.sendMessage(ctx.message.from, `Uso: ${ctx.prefix}detectar <item>`);
        return;
      }

      const item = ctx.args.join(' ');
      const input = `Detectar "${item}" com humor de grupo de zap. Invente um nível (0-100%) e uma descrição absurda. Máximo 2 linhas. Sem template.`;

      const response = await aiService.askAI(input, PersonaMode.ZOEIRA);

      await ctx.client.sendMessage(ctx.message.from, response, {
        quotedMessageId: ctx.message.id._serialized
      });
    } catch (error) {
      logger.error({ err: error }, 'Erro no comando detectar');
      await ctx.client.sendMessage(ctx.message.from, '❌ Erro no detector.');
    }
  }
};

export default DetectarCommand;
