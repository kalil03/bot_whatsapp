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
      const targetId = resolveUserId(ctx.args, mentions) || ctx.message.from;
      const targetName = targetId.split('@')[0];

      const input = `Julgue @${targetName} num tribunal de grupo de zap. Máximo 3 linhas: veredito, crime inventado e pena absurda. Sem template, fale direto.`;

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
