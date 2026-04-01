import { Command, CommandContext } from '../../types/command';
import { aiService } from '../../services/ai.service';
import { PersonaMode } from '../../types/persona';
import { getMentionedUsers } from '../../utils/mentions';
import { resolveUserId } from '../../utils/helpers';
import { logger } from '../../app/logger';

const JulgarCommand: Command = {
  name: 'julgar',
  execute: async (ctx: CommandContext) => {
    try {
      const mentions = await getMentionedUsers(ctx.message);
      let targetId = resolveUserId(ctx.args, mentions) || ctx.message.from;
      let targetName = targetId.split('@')[0];

      const input = `Julgue @${targetName} de forma sarcástica e zoeira. Retorne EXATAMENTE este formato e adicione um crime criativo:
⚖️ Tribunal do Grupo
Réu: @${targetName}
Veredito: <CULPADO ou INOCENTE>
Motivo: <motivo hilário gerado por você>`;

      const response = await aiService.askAI(input, PersonaMode.ZOEIRA);
      
      await ctx.client.sendMessage(ctx.message.from, response, {
        mentions: [targetId],
        quotedMessageId: ctx.message.id._serialized
      });
    } catch (error) {
      logger.error({ err: error }, 'Erro no comando julgar');
      await ctx.client.sendMessage(ctx.message.from, '❌ O tribunal falhou ao julgar.');
    }
  }
};

export default JulgarCommand;
