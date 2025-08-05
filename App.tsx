import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { CourseOption, PaymentMethod, FormData, HowFoundOption, CardPaymentPlan } from './types';
import { COURSE_OPTIONS, PAYMENT_METHODS, HOW_FOUND_OPTIONS, CARD_PAYMENT_PLAN_OPTIONS } from './constants';
import InputField from './components/InputField';
import SelectField from './components/SelectField';
import Button from './components/Button';
import PaymentOptions from './components/PaymentOptions';
import Modal from './components/Modal';
import TermsAndConditions from './components/TermsAndConditions';
import DigitalSignatureInput from './components/SignaturePad';
import EmailVerificationStep from './components/EmailVerificationStep';
import { generateWelcomeMessage, formatDataForSheet } from './services/geminiService';

// --- Validation and Masking Functions ---
const maskCPF = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .slice(0, 14);
};

const validateCPF = (cpf: string) => {
  const cpfClean = (cpf || '').replace(/[^\d]/g, '');
  if (cpfClean.length !== 11 || /^(\d)\1+$/.test(cpfClean)) return false;
  let sum = 0;
  let remainder;
  for (let i = 1; i <= 9; i++) sum += parseInt(cpfClean.substring(i - 1, i)) * (11 - i);
  remainder = (sum * 10) % 11;
  if ((remainder === 10) || (remainder === 11)) remainder = 0;
  if (remainder !== parseInt(cpfClean.substring(9, 10))) return false;
  sum = 0;
  for (let i = 1; i <= 10; i++) sum += parseInt(cpfClean.substring(i - 1, i)) * (12 - i);
  remainder = (sum * 10) % 11;
  if ((remainder === 10) || (remainder === 11)) remainder = 0;
  if (remainder !== parseInt(cpfClean.substring(10, 11))) return false;
  return true;
};

const maskPhone = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{4}).*/, '$1-$2');
};

const validatePhone = (phone: string) => {
  const phoneClean = (phone || '').replace(/\D/g, '');
  return phoneClean.length >= 10 && phoneClean.length <= 11;
};

// RG formats vary greatly, so we don't apply a strict mask, just length validation.
const validateRG = (rg: string) => {
  const rgClean = (rg || '').replace(/[^\d\w]/g, '');
  return rgClean.length >= 7;
};

const maskBirthDate = (value: string) => {
  let maskedValue = value.replace(/\D/g, '');
  if (maskedValue.length > 2) maskedValue = `${maskedValue.slice(0, 2)}/${maskedValue.slice(2)}`;
  if (maskedValue.length > 5) maskedValue = `${maskedValue.slice(0, 5)}/${maskedValue.slice(5, 9)}`;
  return maskedValue.slice(0, 10);
};

const validateBirthDate = (dateStr: string) => {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return false;

  const [day, month, year] = dateStr.split('/').map(Number);
  const date = new Date(year, month - 1, day);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return false; // Invalid date (e.g., Feb 30)
  }
  if (date > new Date()) {
    return false; // Date is in the future
  }
  return true;
};


const CONFIRMATION_PHRASE = "Eu sou responsável e estou ciente";

const initialFormData: FormData = {
  name: '',
  email: '',
  phone: '',
  cpf: '',
  rg: '',
  birthDate: '',
  address: '',
  instagram: '',
  course: CourseOption.PROFISSIONAL,
  paymentMethod: PaymentMethod.PIX,
  cardPaymentPlan: null,
  howFound: HowFoundOption.INSTAGRAM,
  howFoundOther: '',
  termsAccepted: false,
  isMinor: false,
  parentName: '',
  parentCpf: '',
  parentRg: '',
  signatureConfirmation: '',
};

// --- Icons ---
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const EmailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const ShieldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.917l9 2.5 9-2.5a12.02 12.02 0 00-2.382-9.971z" /></svg>;
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const IdIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 012-2h2a2 2 0 012 2v1m-4 0h4" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 15h3" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const PixIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M10.135 1.637a2.053 2.053 0 0 0-2.028.002L.81 7.29a2.053 2.053 0 0 0-1.028 1.777v6.01a2.053 2.053 0 0 0 1.028 1.777l7.298 5.65a2.053 2.053 0 0 0 2.027.002l7.298-5.65a2.053 2.053 0 0 0 1.028-1.777v-6.01a2.053 2.053 0 0 0-1.028-1.777l-7.298-5.65zM12 11.284l-4.14-3.203L12 4.88l4.14 3.202L12 11.284zm-5.756 3.193l4.14 3.202v-4.757l-4.14-3.202v4.757zm1.616.845L3.72 12.12v-1.15l4.14 3.202v1.15zm8.281-4.038l-4.14 3.202v4.757l4.14-3.202v-4.757zm1.615-.845v1.15l-4.14 3.202v-1.15l4.14-3.202z"/></svg>;
const CashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><circle cx="12" cy="12" r="4"></circle><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line></svg>;
const CardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>;
const CryptoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="M15 9.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"></path><path d="M15 14.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"></path></svg>;
const WhatsAppIcon = () => <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.267.651 4.383 1.898 6.206l-.277.424-1.125 4.105 4.095-1.082.387-.21zm-1.124-7.404c-.076-.123-.247-.198-.448-.204-.202-.005-.448-.005-.623-.005-.167 0-.448.058-.687.306-.245.248-.863.858-.863 2.064 0 1.206.888 2.394 1.012 2.569.124.176 1.758 2.83 4.253 3.75.527.181.935.289 1.266.364.475.113.871.09.951-.044.225-.213.682-.87.781-1.025s.099-.155.025-.28c-.075-.125-.278-.225-.376-.275-.099-.05-1.157-.565-1.336-.625-.179-.06-.31-.09-.448.09-.139.179-.506.624-.623.75-.117.124-.234.15-.41.09-.176-.061-1.041-.377-1.982-1.222-.733-.656-1.221-1.475-1.345-1.725-.124-.25-.062-.39.025-.519.087-.129.199-.213.298-.32.099-.104.149-.178.224-.298.075-.124.038-.224-.012-.324-.05-.1-.448-1.063-.614-1.455z"/></svg>;


const paymentMethodIcons: Record<string, React.ReactNode> = {
    [PaymentMethod.PIX]: <PixIcon />,
    [PaymentMethod.CASH]: <CashIcon />,
    [PaymentMethod.CARD]: <CardIcon />,
    [PaymentMethod.CRYPTO]: <CryptoIcon />,
};

const paymentOptionsWithIcons = PAYMENT_METHODS.map(option => ({...option, icon: paymentMethodIcons[option.value]}));

const SuccessDisplay: React.FC<{
  message: string;
  name: string;
  onReset: () => void;
  csvData: string;
}> = ({ message, name, onReset, csvData }) => {
    const phoneNumber = '5542999722042';
    const whatsappMessage = `Olá, Luxury Studio!\n\nSegue uma nova inscrição para o curso da LuxAcademy:\n\n*Nome:* ${name}\n\n*Dados (CSV):*\n${csvData}`;
    const whatsappHref = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`;

    return (
        <div className="w-full max-w-2xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-2xl text-center flex flex-col items-center animate-fade-in">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                 <svg className="h-10 w-10 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Falta só um passo!</h2>
            <p className="text-lg text-gray-600 mb-2">Olá {name},</p>
            <p className="text-lg text-gray-600 mb-8 italic">"{message}"</p>
            <p className="text-gray-500 mb-6">Envie agora mesmo para o WhatsApp da Joy e aguarde a confirmação para o pagamento.</p>
            
            <div className="w-full max-w-sm mb-4">
              <a 
                href={whatsappHref} 
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex justify-center items-center rounded-md border border-transparent bg-green-600 py-3 px-4 text-base font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300"
              >
                <WhatsAppIcon />
                Enviar por WhatsApp
              </a>
            </div>

            <Button onClick={onReset} type="button">Fazer Nova Inscrição</Button>
        </div>
    );
};

const calculateAge = (birthDate: string) => { // birthDate is DD/MM/YYYY
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(birthDate)) return 0;
    const [day, month, year] = birthDate.split('/').map(Number);
    const currentYear = new Date().getFullYear();
    if (year < 1900 || year > currentYear) return 0;
    const birthDateObj = new Date(year, month - 1, day);
    if (birthDateObj.getFullYear() !== year || birthDateObj.getMonth() !== month - 1 || birthDateObj.getDate() !== day) return 0;
    const today = new Date();
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const m = today.getMonth() - birthDateObj.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
    }
    return age;
};

const App: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [csvData, setCsvData] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasScrolledTerms, setHasScrolledTerms] = useState(false);
  const [termsWarning, setTermsWarning] = useState<string | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  useEffect(() => {
    if (termsWarning) {
        const timer = setTimeout(() => setTermsWarning(null), 2000);
        return () => clearTimeout(timer);
    }
  }, [termsWarning]);

  useEffect(() => {
      const age = calculateAge(formData.birthDate);
      setFormData(prev => ({ ...prev, isMinor: age > 0 && age < 18 }));
  }, [formData.birthDate]);

  const handleTermsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (hasScrolledTerms) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 5) { // Add a small buffer
        setHasScrolledTerms(true);
    }
  };

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setErrors(prev => ({ ...prev, [name]: '', _submit: '' }));

    let finalValue: string | boolean = type === 'checkbox' ? checked : value;
    
    if (type !== 'checkbox') {
      switch (name) {
        case 'cpf':
        case 'parentCpf':
          finalValue = maskCPF(value);
          break;
        case 'phone':
          finalValue = maskPhone(value);
          break;
        case 'birthDate':
          finalValue = maskBirthDate(value);
          break;
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: finalValue as never }));
  }, []);

  const handleSelectChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setErrors(prev => ({ ...prev, [name]: '', _submit: '' }));
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);
  
  const handlePaymentChange = useCallback((value: string) => {
    setErrors(prev => ({ ...prev, paymentMethod: '', _submit: '' }));
    setFormData(prev => ({ 
      ...prev, 
      paymentMethod: value as PaymentMethod,
      cardPaymentPlan: value === PaymentMethod.CARD ? (prev.cardPaymentPlan || CardPaymentPlan.FULL) : null,
    }));
  }, []);

  const handleTermsAreaClick = useCallback(() => {
    if (!hasScrolledTerms) {
        setTermsWarning("Por favor, leia os termos até o final para poder marcar a caixa.");
    }
  }, [hasScrolledTerms]);

  const steps = useMemo(() => [
    { id: 'name', label: "Primeiramente, qual seu nome completo?", component: InputField, props: { type: 'text', placeholder: "Seu nome completo", icon: <UserIcon />, required: true } },
    { id: 'email', label: "Ótimo! Agora, qual o seu melhor e-mail?", component: EmailVerificationStep, props: { placeholder: "seu.email@exemplo.com", icon: <EmailIcon />, required: true } },
    { id: 'phone', label: "Qual seu número de Telefone/WhatsApp?", component: InputField, props: { type: 'tel', placeholder: "(00) 00000-0000", icon: <PhoneIcon />, required: true } },
    { id: 'cpf', label: "Para o contrato, precisamos do seu CPF.", component: InputField, props: { type: 'text', placeholder: "000.000.000-00", icon: <ShieldIcon />, required: true } },
    { id: 'rg', label: "E também do seu RG.", component: InputField, props: { type: 'text', placeholder: "00.000.000-0", icon: <IdIcon />, required: true } },
    { id: 'birthDate', label: "Qual sua data de nascimento?", component: InputField, props: { type: 'text', placeholder: "DD/MM/AAAA", icon: <CalendarIcon />, required: true } },
    { condition: (data: FormData) => data.isMinor, id: 'parentName', label: "Como você é menor de idade, qual o nome do seu responsável?", component: InputField, props: { placeholder: "Nome completo do responsável", icon: <UserIcon />, required: true } },
    { condition: (data: FormData) => data.isMinor, id: 'parentCpf', label: "Qual o CPF do responsável?", component: InputField, props: { placeholder: "000.000.000-00", icon: <ShieldIcon />, required: true } },
    { condition: (data: FormData) => data.isMinor, id: 'parentRg', label: "E o RG do responsável?", component: InputField, props: { placeholder: "00.000.000-0", icon: <IdIcon />, required: true } },
    { id: 'address', label: "Qual o seu endereço completo?", component: InputField, props: { type: 'text', placeholder: "Rua, Nº, Bairro, Cidade/Estado, CEP", icon: <HomeIcon />, required: true } },
    { id: 'course', label: "Qual curso da LuxAcademy você deseja fazer?", component: SelectField, props: { options: COURSE_OPTIONS, required: true } },
    { id: 'howFound', label: "Como você nos encontrou?", component: SelectField, props: { options: HOW_FOUND_OPTIONS, required: true } },
    { condition: (data: FormData) => data.howFound === HowFoundOption.OTHER, id: 'howFoundOther', label: "Poderia nos dizer como nos encontrou?", component: InputField, props: { placeholder: "Ex: Anúncio no Facebook, TikTok, etc.", icon: <SearchIcon />, required: true } },
    { id: 'instagram', label: "Qual o seu Instagram? (Opcional)", component: InputField, props: { type: 'text', placeholder: "@seu_perfil" } },
    { id: 'paymentMethod', label: "Escolha a forma de pagamento.", component: PaymentOptions, props: { options: paymentOptionsWithIcons } },
    { condition: (data: FormData) => data.paymentMethod === PaymentMethod.CARD, id: 'cardPaymentPlan', label: "Qual o plano de pagamento no cartão?", component: SelectField, props: { options: CARD_PAYMENT_PLAN_OPTIONS, required: true } },
    { id: 'signatureConfirmation', label: formData.isMinor ? "Confirmação por Escrito do Responsável" : "Sua Confirmação por Escrito", component: DigitalSignatureInput, props: { isConfirmed: formData.signatureConfirmation.trim() === CONFIRMATION_PHRASE, required: true } },
    { id: 'termsAccepted', label: "Termos e Condições", component: () => (
        <div className="flex flex-col items-center text-center -mt-4">
            <div
                className="flex items-start p-2 rounded-md"
                onClick={handleTermsAreaClick}
                role="button"
                tabIndex={!hasScrolledTerms ? 0 : -1}
                onKeyDown={(e) => !hasScrolledTerms && e.key === 'Enter' && handleTermsAreaClick()}
                aria-label="Aceitar termos e condições"
            >
                <div className="flex items-center h-5 pt-0.5">
                    <input
                        id="termsAccepted"
                        name="termsAccepted"
                        type="checkbox"
                        checked={formData.termsAccepted}
                        onChange={handleInputChange}
                        disabled={!hasScrolledTerms}
                        className="focus:ring-yellow-500 h-4 w-4 text-yellow-600 border-gray-300 rounded disabled:bg-gray-200"
                        style={{ cursor: hasScrolledTerms ? 'pointer' : 'not-allowed' }}
                        aria-describedby="terms-description"
                    />
                </div>
                <div className="ml-3 text-sm">
                    <label
                        htmlFor="termsAccepted"
                        className={`font-medium transition-colors duration-300 ${hasScrolledTerms ? 'text-green-600 cursor-pointer' : 'text-red-600 cursor-not-allowed'}`}
                    >
                        Eu li e aceito os
                    </label>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsModalOpen(true)
                        }}
                        className="underline text-yellow-600 hover:text-yellow-700 mx-1"> termos e condições</button>
                    <span className={`transition-colors duration-300 ${hasScrolledTerms ? 'text-green-600' : 'text-red-600'}`}> do curso.</span>
                </div>
            </div>
            {termsWarning && (
                 <div className="mt-2 p-3 w-full max-w-sm bg-red-100 text-red-800 font-semibold rounded-lg shadow-md animate-shake text-center" role="alert">
                    {termsWarning}
                </div>
            )}
        </div>
    )},
  ], [formData, handleInputChange, hasScrolledTerms, handleTermsAreaClick, isEmailVerified]);

  const visibleSteps = useMemo(() => steps.filter(step => !step.condition || step.condition(formData)), [steps, formData]);
  
  const currentStep = visibleSteps[currentStepIndex];

  const validateCurrentStep = (): boolean => {
    const stepId = currentStep.id as keyof FormData;
    const value = formData[stepId];
    let isValid = true;
    let errorMessage = '';

    if (currentStep.props?.required) {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        isValid = false;
        errorMessage = 'Este campo é obrigatório.';
      }
    }

    if (isValid && value) {
      switch (stepId) {
        case 'cpf':
        case 'parentCpf':
          if (!validateCPF(value as string)) {
            isValid = false;
            errorMessage = 'CPF inválido. Verifique os dígitos.';
          }
          break;
        case 'phone':
          if (!validatePhone(value as string)) {
            isValid = false;
            errorMessage = 'Telefone inválido. Deve ter 10 ou 11 dígitos.';
          }
          break;
        case 'rg':
        case 'parentRg':
          if (!validateRG(value as string)) {
            isValid = false;
            errorMessage = 'RG inválido. Deve ter pelo menos 7 caracteres.';
          }
          break;
        case 'birthDate':
          if (!validateBirthDate(value as string)) {
            isValid = false;
            errorMessage = 'Data inválida. Use DD/MM/AAAA e não pode ser uma data futura.';
          }
          break;
        case 'email':
          if (!isEmailVerified) {
            isValid = false;
            errorMessage = 'Por favor, conclua a verificação do e-mail.';
          }
          break;
        case 'termsAccepted':
          if (!formData.termsAccepted) {
            isValid = false;
            errorMessage = 'Você deve aceitar os termos para continuar.';
          }
          break;
        case 'signatureConfirmation':
          if ((value as string).trim() !== CONFIRMATION_PHRASE) {
            isValid = false;
            errorMessage = 'A frase de confirmação não corresponde.';
          }
          break;
      }
    }

    if (!isValid) {
      setErrors({ [stepId]: errorMessage });
      return false;
    }

    setErrors({});
    return true;
  };
  
  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStepIndex < visibleSteps.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
      } else {
        handleSubmit();
      }
    }
  };
  
  const handleBack = () => {
    setErrors({});
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setErrors({});
    try {
      const [message, formattedData] = await Promise.all([
        generateWelcomeMessage(formData.name, formData.course as CourseOption),
        formatDataForSheet(formData)
      ]);
      setWelcomeMessage(message);
      setCsvData(formattedData);
      setSubmissionSuccess(true);
    } catch (err) {
      setErrors({ _submit: 'Houve um erro ao processar sua inscrição. Tente novamente.' });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setCurrentStepIndex(0);
    setSubmissionSuccess(false);
    setWelcomeMessage('');
    setCsvData('');
    setErrors({});
    setHasScrolledTerms(false);
    setIsEmailVerified(false);
  };

  const renderStepComponent = () => {
    const StepComponent = currentStep.component as React.ElementType;

    if (currentStep.id === 'email') {
        return (
            <EmailVerificationStep
                id={currentStep.id}
                value={formData.email}
                onChange={handleInputChange}
                onVerified={setIsEmailVerified}
                isVerified={isEmailVerified}
                placeholder={currentStep.props.placeholder}
                icon={currentStep.props.icon}
            />
        );
    }
    
    if (StepComponent === PaymentOptions) {
        return <PaymentOptions selectedValue={formData.paymentMethod} onChange={handlePaymentChange} options={paymentOptionsWithIcons} />;
    }
    
    const commonProps = {
      onChange: StepComponent === SelectField ? handleSelectChange : handleInputChange,
      value: formData[currentStep.id as keyof FormData],
      id: currentStep.id,
      name: currentStep.id,
      ...currentStep.props
    };
    
    return <StepComponent {...commonProps} />;
  }
  
  const progressPercentage = ((currentStepIndex + 1) / visibleSteps.length) * 100;
  const currentError = errors[currentStep.id] || errors._submit;

  return (
    <main className="min-h-screen bg-rose-50/50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        {submissionSuccess ? (
            <SuccessDisplay message={welcomeMessage} name={formData.name} onReset={resetForm} csvData={csvData} />
        ) : (
            <div className="w-full max-w-2xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800">LuxAcademy</h1>
                    <p className="text-lg text-gray-500 mt-2">Inscrição para Curso</p>
                </div>
                
                <div className="mb-8">
                    <div className="flex justify-between mb-1">
                        <span className="text-base font-medium text-yellow-700">Passo {currentStepIndex + 1} de {visibleSteps.length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-yellow-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                </div>

                <div className="text-center min-h-[180px] flex flex-col justify-center items-center animate-fade-in">
                    <label htmlFor={currentStep.id} className="block text-xl font-semibold text-gray-800 mb-6">
                        {currentStep.label}
                    </label>
                    <div className="w-full max-w-md">
                        {renderStepComponent()}
                    </div>
                </div>

                {currentError && <p className="text-red-600 text-sm text-center mt-4 animate-shake">{currentError}</p>}
                
                <div className="mt-10 flex gap-4 items-center">
                    {currentStepIndex > 0 && (
                        <button
                            type="button"
                            onClick={handleBack}
                            className="w-1/3 rounded-md border border-gray-300 bg-white py-3 px-4 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all duration-300"
                        >
                            Voltar
                        </button>
                    )}
                    <div className="flex-grow">
                         <Button onClick={handleNext} isLoading={isLoading}>
                            {isLoading ? 'Enviando...' : (currentStepIndex === visibleSteps.length - 1 ? 'Finalizar Inscrição' : 'Próximo')}
                        </Button>
                    </div>
                </div>
            </div>
        )}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Termos e Condições" onContentScroll={handleTermsScroll}>
        <TermsAndConditions />
      </Modal>
    </main>
  );
};

export default App;