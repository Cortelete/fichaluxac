import React from 'react';
import InputField from './InputField';

interface DigitalSignatureInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  isConfirmed: boolean;
}

const CONFIRMATION_PHRASE = "Eu sou responsável e estou ciente";

const DigitalSignatureInput: React.FC<DigitalSignatureInputProps> = ({ id, label, value, onChange, required, isConfirmed }) => {
  return (
    <div className="pt-2">
        <InputField
            id={id}
            label={label}
            type="text"
            value={value}
            onChange={onChange}
            placeholder={CONFIRMATION_PHRASE}
            required={required}
        />
        <p className="mt-2 text-sm text-gray-600">
            Ao escrever a frase acima exatamente como mostrado, você confirma estar assinando em seu nome e concorda com todos os termos.
        </p>
        { value && !isConfirmed && (
            <p className="mt-1 text-xs text-red-600">
                O texto não corresponde à frase de confirmação.
            </p>
        )}
    </div>
  );
};

export default DigitalSignatureInput;