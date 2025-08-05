
import React, { useState, useEffect } from 'react';
import InputField from './InputField';
import Button from './Button';
import { generateVerificationCode } from '../services/geminiService';

interface EmailVerificationStepProps {
  id: string;
  value: string; // email value
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onVerified: (status: boolean) => void;
  isVerified: boolean;
  placeholder: string;
  icon?: React.ReactNode;
}

const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const EmailVerificationStep: React.FC<EmailVerificationStepProps> = ({ id, value, onChange, onVerified, isVerified, placeholder, icon }) => {
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [enteredCode, setEnteredCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isEmailValid = EMAIL_REGEX.test(value);

  useEffect(() => {
    // Reset verification status if email changes
    if (!isVerified) {
        onVerified(false);
    }
  }, [value, isVerified, onVerified]);

  const handleSendCode = async () => {
    if (!isEmailValid) {
      setError("Por favor, insira um formato de e-mail válido.");
      return;
    }
    setError(null);
    setIsSendingCode(true);
    try {
      const code = await generateVerificationCode();
      setGeneratedCode(code);
      setCodeSent(true);
    } catch (err) {
      setError("Não foi possível gerar o código. Tente novamente.");
      console.error(err);
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCode = e.target.value.replace(/\D/g, '').slice(0, 6);
    setEnteredCode(newCode);
    setError(null);

    if (newCode.length === 6) {
      if (newCode === generatedCode) {
        onVerified(true);
      } else {
        onVerified(false);
        setError("Código de verificação incorreto.");
      }
    } else {
      onVerified(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <InputField
        id={id}
        label="" 
        type="email"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        icon={icon}
        disabled={codeSent || isSendingCode}
      />
      
      {!codeSent ? (
        <Button onClick={handleSendCode} isLoading={isSendingCode} disabled={!isEmailValid || isSendingCode} type="button">
          Enviar Código de Verificação
        </Button>
      ) : (
        <div className="space-y-4 animate-fade-in">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 p-4 rounded-md" role="alert">
                <p className="font-bold">Código Gerado para Demonstração</p>
                <p>Para simular a verificação, seu código é: <strong className="text-lg tracking-widest">{generatedCode}</strong></p>
                <p className="text-xs mt-1">Em um aplicativo real, este código seria enviado para o seu e-mail.</p>
            </div>
            <InputField
                id="verificationCode"
                label="Código de Verificação de 6 dígitos"
                type="text"
                value={enteredCode}
                onChange={handleCodeChange}
                placeholder="------"
                required
            />
        </div>
      )}
      {error && <p className="text-red-600 text-sm text-center animate-shake">{error}</p>}
    </div>
  );
};

export default EmailVerificationStep;
