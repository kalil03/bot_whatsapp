import { Command, CommandContext } from '../../types/command';
import { aiService } from '../../services/ai.service';
import { PersonaMode } from '../../types/persona';
import { getMentionedUsers } from '../../utils/mentions';
import { resolveUserId } from '../../utils/helpers';
import { logger } from '../../app/logger';

const ZoarCommand: Command = {
  name: 'zoar',
  execute: async (ctx: CommandContext) => {
    try {
      const mentions = await getMentionedUsers(ctx.message);
      let targetId = resolveUserId(ctx.args, mentions);
      
      let input = '';
      if (targetId) {
        let targetName = targetId.split('@')[0];
        input = `Faça uma análise de zoeira leve sobre @${targetName}. Formule sua resposta exatamente assim:
🤡 Análise concluída
Alvo: <nome>
Diagnóstico: <frase sarcástica>
Nível de perigo: <%>`;
      } else if (ctx.args.length > 0) {
        input = `Zoeira leve sobre: ${ctx.args.join(' ')}. Responda como uma brincadeira.`;
      } else {
        await ctx.client.sendMessage(ctx.message.from, `Uso: ${ctx.prefix}zoar @user ou <texto>`);
        return;
      }

      const response = await aiService.askAI(input, PersonaMode.ZOEIRA);
      
      await ctx.client.sendMessage(ctx.message.from, response, {
        mentions: targetId ? [targetId] : [],
        quotedMessageId: ctx.message.id._serialized
      });
    } catch (error) {
      logger.error({ err: error }, 'Erro no comando zoar');
      await ctx.client.sendMessage(ctx.message.from, '❌ Erro ao tentar zoar.');
    }
  }
};

export default ZoarCommand;
