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
      const input = `Seja sarcástico e invente um nível (0 a 100%) e uma classe para o item "${item}". Retorne EXATAMENTE neste formato:
🧪 Detector
Item: ${item}
Nível: <% genérico>
Classe: <frase criativa inventada por você>`;

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
