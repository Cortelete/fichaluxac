import { CourseOption, PaymentMethod, HowFoundOption, CardPaymentPlan } from './types';

export const COURSE_OPTIONS = [
  { value: CourseOption.PROFISSIONAL, label: 'Lash Profissional - R$ 899' },
  { value: CourseOption.EMPREENDEDORA, label: 'Lash Empreendedora - R$ 1099' },
  { value: CourseOption.EMPRESARIA_VIP, label: 'Lash Empresária VIP - R$ 1499' },
];

export const PAYMENT_METHODS = [
  { value: PaymentMethod.PIX, label: 'PIX', description: 'Rápido e fácil' },
  { value: PaymentMethod.CASH, label: 'Dinheiro', description: 'Controle total' },
  { value: PaymentMethod.CARD, label: 'Cartões', description: 'Conveniente e seguro' },
  { value: PaymentMethod.CRYPTO, label: 'Criptomoedas', description: 'Inovador e global' },
];

export const HOW_FOUND_OPTIONS = [
    { value: HowFoundOption.INSTAGRAM, label: 'Instagram' },
    { value: HowFoundOption.FRIENDS, label: 'Indicação de amigos' },
    { value: HowFoundOption.GOOGLE, label: 'Pesquisa no Google' },
    { value: HowFoundOption.OTHER, label: 'Outro' },
];

export const CARD_PAYMENT_PLAN_OPTIONS = [
    { value: CardPaymentPlan.FULL, label: 'Pagamento à vista' },
    { value: CardPaymentPlan.ONE_INSTALLMENT, label: 'Entrada + 1x no cartão' },
    { value: CardPaymentPlan.TWO_INSTALLMENTS, label: 'Entrada + 2x no cartão' },
];
