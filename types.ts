
export enum CourseOption {
  PROFISSIONAL = 'Lash Profissional',
  EMPREENDEDORA = 'Lash Empreendedora',
  EMPRESARIA_VIP = 'Lash Empresária VIP',
}

export enum PaymentMethod {
  PIX = 'PIX',
  CASH = 'Dinheiro',
  CARD = 'Cartões',
  CRYPTO = 'Criptomoedas',
}

export enum HowFoundOption {
    INSTAGRAM = 'Instagram',
    FRIENDS = 'Indicação de amigos',
    GOOGLE = 'Pesquisa no Google',
    OTHER = 'Outro',
}

export enum CardPaymentPlan {
  FULL = 'Pagamento à vista',
  ONE_INSTALLMENT = 'Entrada + 1x no cartão',
  TWO_INSTALLMENTS = 'Entrada + 2x no cartão',
}

export interface FormData {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  rg: string;
  birthDate: string;
  address: string;
  instagram: string;
  course: CourseOption;
  paymentMethod: PaymentMethod | string;
  cardPaymentPlan?: CardPaymentPlan | null;
  howFound: HowFoundOption;
  howFoundOther?: string;
  termsAccepted: boolean;
  isMinor: boolean;
  parentName?: string;
  parentCpf?: string;
  parentRg?: string;
  signatureConfirmation: string;
}
