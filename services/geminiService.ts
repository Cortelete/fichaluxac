
import { GoogleGenAI } from "@google/genai";
import { CourseOption } from '../types';

let ai: GoogleGenAI | null = null;

const getAiClient = (): GoogleGenAI => {
    if (!ai) {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            console.error("API_KEY is not set. Please configure the environment variable.");
            throw new Error("API Key not found.");
        }
        ai = new GoogleGenAI({ apiKey });
    }
    return ai;
};

export const generateWelcomeMessage = async (name: string, course: CourseOption): Promise<string> => {
  const courseDescriptions: Record<CourseOption, string> = {
    [CourseOption.PROFISSIONAL]: 'focado em construir uma base técnica sólida e impecável',
    [CourseOption.EMPREENDEDORA]: 'desenhado para aprimorar suas habilidades e iniciar seu próprio negócio com confiança',
    [CourseOption.EMPRESARIA_VIP]: 'uma masterclass exclusiva para você se tornar uma referência no mercado de beleza',
  };

  const prompt = `
    Você é a assistente virtual da LuxAcademy by Joyci Almeida, um estúdio de beleza de luxo.
    Um novo aluno chamado "${name}" acabou de se inscrever no curso "${course}".
    
    Escreva uma mensagem de boas-vindas calorosa, elegante e inspiradora para ${name}. 
    A mensagem deve:
    1. Parabenizá-lo(a) pela inscrição.
    2. Mencionar o curso específico que ele(a) escolheu.
    3. Destacar brevemente o principal benefício do curso escolhido: "${courseDescriptions[course]}".
    4. Terminar com uma nota de entusiasmo sobre a jornada que está por vir.
    5. Manter um tom profissional, luxuoso e encorajador.
    6. Seja conciso, no máximo 4 frases.
  `;

  try {
    const client = getAiClient();
    const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating welcome message:", error);
    return `Olá ${name}, seja muito bem-vinda(o) à LuxAcademy! Estamos incrivelmente felizes por você ter se juntado ao nosso curso de ${course}. Prepare-se para uma jornada de transformação e sucesso. Estamos ansiosos para começar!`;
  }
};

export const generateVerificationCode = async (): Promise<string> => {
    const prompt = `
        Gere um código de verificação numérico de 6 dígitos.
        Responda APENAS com os 6 dígitos. Não inclua nenhum outro texto, formatação ou explicação.
        Exemplo de resposta: 123456
    `;

    try {
        const client = getAiClient();
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        const code = response.text.trim().replace(/\D/g, '');
        if (code.length === 6) {
            return code;
        }
        // Fallback if Gemini returns something weird
        throw new Error("Invalid code format from API");
    } catch (error) {
        console.error("Error generating verification code, using fallback:", error);
        // Fallback to a client-side generated code
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
};
