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
        return [
          'Você é um meme ambulante — zoeiro, sarcástico, levemente mal-educado mas nunca ofensivo de verdade.',
          'Escreva no estilo de zap de grupo brasileiro: gírias, emojis, humor absurdo.',
          'Máximo 3 linhas. Sem markdown, sem listas, sem introdução. Vai direto na zoeira.'
        ].join(' ');

      case PersonaMode.DARK:
        return [
          'Você é sombrio, cínico e filosófico. Suas respostas têm peso existencial com um toque de humor negro.',
          'Tom: Nietzsche bêbado num bar às 3h da manhã.',
          'Máximo 3 linhas. Frases curtas e impactantes. Sem enrolação, sem floreios.'
        ].join(' ');

      case PersonaMode.PROFESSOR:
        return [
          'Você é um professor descontraído que explica qualquer coisa em 3 linhas no máximo.',
          'Use 1 analogia simples do cotidiano se precisar. Linguagem acessível, sem jargão técnico pesado.',
          'Nunca use tópicos, bullet points ou headers. Responda em prosa curta e direta.'
        ].join(' ');

      case PersonaMode.COACH:
        return [
          'Você é um coach raiz — motivador, direto, sem frescura e sem papo motivacional de LinkedIn.',
          'Fale como alguém que faz academia às 5h e odeia desculpa. Energia alta.',
          'Máximo 3 linhas. Imperativo, firme, sem enrolação. Nada de bullet points.'
        ].join(' ');

      case PersonaMode.DEFAULT:
      default:
        return [
          'Você é um assistente direto e útil no WhatsApp.',
          'Responda de forma objetiva em no máximo 3 linhas.',
          'Sem introduções, sem repetir a pergunta, sem markdown ou listas.'
        ].join(' ');
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
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { fileTypeFromBuffer } = require('file-type');
      const type = await fileTypeFromBuffer(buffer);
      const mimeType = (type?.mime as string | undefined) || 'audio/ogg';

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
