import React from 'react';

interface PaymentOption {
  value: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

interface PaymentOptionsProps {
  options: PaymentOption[];
  selectedValue: string;
  onChange: (value: string) => void;
}

const PaymentOptions: React.FC<PaymentOptionsProps> = ({ options, selectedValue, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Forma de Pagamento
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex flex-col items-center justify-start py-4 px-2 rounded-lg border-2 text-center transition-all duration-200 ease-in-out cursor-pointer h-full
              ${
                selectedValue === option.value
                  ? 'border-yellow-500 bg-yellow-50 shadow-lg scale-105'
                  : 'border-gray-200 bg-white hover:border-yellow-400 hover:bg-yellow-50/50'
              }`}
          >
            <div className={`mb-2 transition-colors ${selectedValue === option.value ? 'text-yellow-600' : 'text-gray-500'}`}>
              {option.icon}
            </div>
            <span className={`font-semibold text-sm transition-colors ${selectedValue === option.value ? 'text-gray-900' : 'text-gray-800'}`}>
              {option.label}
            </span>
            <span className={`text-xs mt-1 transition-colors ${selectedValue === option.value ? 'text-gray-700' : 'text-gray-500'}`}>
              {option.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PaymentOptions;
