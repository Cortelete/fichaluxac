
import React from 'react';

interface InputFieldProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required?: boolean;
  icon?: React.ReactNode;
}

const InputField: React.FC<InputFieldProps> = ({ id, label, type, value, onChange, placeholder, required = false, icon }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        {icon && <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">{icon}</div>}
        <input
          type={type}
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full rounded-md border border-gray-300 bg-white py-2.5 shadow-sm text-gray-900 transition duration-150 ease-in-out focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 sm:text-sm ${icon ? 'pl-10' : 'pl-4'}`}
        />
      </div>
    </div>
  );
};

export default InputField;