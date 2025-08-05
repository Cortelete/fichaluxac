
import { GoogleGenAI } from "@google/genai";
import { CourseOption, FormData, PaymentMethod, HowFoundOption } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This case will be handled by the environment, but it's good practice to check.
  console.error("API_KEY is not set. Please configure the environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

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
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating welcome message:", error);
    return `Olá ${name}, seja muito bem-vinda(o) à LuxAcademy! Estamos incrivelmente felizes por você ter se juntado ao nosso curso de ${course}. Prepare-se para uma jornada de transformação e sucesso. Estamos ansiosos para começar!`;
  }
};

export const formatDataForSheet = async (data: FormData): Promise<string> => {
    let paymentDetail = data.paymentMethod;
    if (data.paymentMethod === PaymentMethod.CARD && data.cardPaymentPlan) {
        paymentDetail = `${data.paymentMethod} (${data.cardPaymentPlan})`;
    }
    
    let howFoundDetail: string = data.howFound;
    if (data.howFound === HowFoundOption.OTHER && data.howFoundOther) {
        howFoundDetail = `${data.howFound}: ${data.howFoundOther.trim()}`;
    }

    const formattedBirthDate = data.birthDate || 'N/A';

    const sheetData: Record<string, string | undefined> = {
        "Nome Completo": data.name,
        "Email": data.email,
        "Telefone": data.phone,
        "CPF": data.cpf,
        "RG": data.rg,
        "Data de Nascimento": formattedBirthDate,
        "Endereço Completo": data.address,
        "Instagram": data.instagram || 'N/A',
        "Curso Escolhido": data.course,
        "Forma de Pagamento": paymentDetail,
        "Como nos encontrou": howFoundDetail,
        "Data de Inscrição": new Date().toLocaleDateString('pt-BR'),
        "É menor de idade": data.isMinor ? 'Sim' : 'Não',
        "Nome do Responsável": data.isMinor ? data.parentName : 'N/A',
        "CPF do Responsável": data.isMinor ? data.parentCpf : 'N/A',
        "RG do Responsável": data.isMinor ? data.parentRg : 'N/A',
        "Confirmação por Escrita": data.signatureConfirmation ? 'Confirmado' : 'Não Confirmado',
    };
    
    const headers = [
        "Nome Completo", "Email", "Telefone", "CPF", "RG", "Data de Nascimento", "Endereço Completo", "Instagram", 
        "Curso Escolhido", "Forma de Pagamento", "Como nos encontrou", "Data de Inscrição", 
        "É menor de idade", "Nome do Responsável", "CPF do Responsável", "RG do Responsável", "Confirmação por Escrita"
    ];

    const prompt = `
    Converta o seguinte objeto JSON em uma única linha de valores separados por vírgula (CSV).
    A ordem dos valores deve corresponder exatamente a esta lista de cabeçalhos: ${headers.map(h => `"${h}"`).join(', ')}.
    Cada valor na linha CSV deve ser envolvido por aspas duplas.
    Não inclua a linha de cabeçalho na sua resposta. Responda APENAS com a linha de dados CSV.

    JSON de entrada:
    ${JSON.stringify(sheetData)}
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text.trim();
  } catch(error) {
    console.error("Error formatting data for sheet:", error);
    // Fallback to manual formatting
    const orderedData = headers.map(header => sheetData[header] || '');
    return orderedData.map(value => `"${value}"`).join(',');
  }
};