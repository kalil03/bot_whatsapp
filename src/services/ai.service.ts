import { GoogleGenAI } from '@google/genai';
import { config } from '../app/config';
import { logger } from '../app/logger';
import { PersonaMode } from '../types/persona';

class AIService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    if (config.GEMINI_API_KEY) {
      this.ai = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
    } else {
      logger.warn('⚠️ GEMINI_API_KEY não configurada. Serviço de IA desativado.');
    }
  }

  private getPromptForMode(mode: PersonaMode): string {
    switch (mode) {
      case PersonaMode.ZOEIRA:
        return 'Você é um botequeiro zoeiro e sarcástico. Suas respostas têm humor, ironia leve, criatividade e estilo de meme. Responda curto (máx 6 linhas). Nunca gere discurso de ódio ou ataque ofensivo pesado.';
      case PersonaMode.DARK:
        return 'Você tem uma personalidade dark, sarcástica, sombria, dramática e muito estilosa. Suas respostas são impactantes e curtas (máx 6 linhas). Jamais ofenda de forma pesada.';
      case PersonaMode.PROFESSOR:
        return 'Você é um professor didático, claro e direto. Responda simples, muitas vezes dando um exemplo curto (máx 6 linhas).';
      case PersonaMode.COACH:
        return 'Você é um coach hiper motivador, com energia no topo, que fala direto ao ponto. Respostas curtas e de impacto (máx 6 linhas), sem humilhar.';
      case PersonaMode.DEFAULT:
      default:
        return 'Você é um assistente prestativo, claro, direto e muito útil no WhatsApp. Responda de forma concisa (máx 6 linhas).';
    }
  }

  async askAI(input: string, mode: PersonaMode = PersonaMode.DEFAULT, context?: string): Promise<string> {
    if (!this.ai) return 'Serviço de IA não está disponível (API Key ausente).';

    try {
      const fullPrompt = context ? `${context}\n\nUsuário: ${input}` : input;
      const systemInstruction = this.getPromptForMode(mode);

      const response = await this.ai.models.generateContent({
        model: config.GEMINI_MODEL,
        contents: fullPrompt,
        config: {
          systemInstruction,
          temperature: 0.8,
        }
      });
      
      return response.text?.trim() || 'Não consegui formular uma resposta.';
    } catch (error) {
      logger.error({ err: error }, `Erro ao chamar Gemini API (Mode: ${mode})`);
      return 'Ocorreu um erro ao consultar a IA. Tente novamente mais tarde.';
    }
  }

  async transcribeAudio(buffer: Buffer): Promise<string> {
    if (!this.ai) throw new Error('API Key do Gemini não configurada.');

    try {
      const { fileTypeFromBuffer } = await import('file-type');
      const type = await fileTypeFromBuffer(buffer);
      const mimeType = type?.mime || 'audio/ogg';

      const response = await this.ai.models.generateContent({
        model: config.GEMINI_MODEL,
        contents: [
          {
            text: 'Transcreva este áudio exatamente como falado, em texto puro, sem comentários adicionais.',
          },
          {
            inlineData: {
              data: buffer.toString('base64'),
              mimeType,
            },
          }
        ]
      });

      return response.text?.trim() || 'Não foi possível transcrever este áudio.';
    } catch (error) {
      logger.error({ err: error }, 'Erro na transcrição via Gemini');
      throw error;
    }
  }
}

export const aiService = new AIService();
