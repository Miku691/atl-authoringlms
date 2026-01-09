import React from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
    value: string;
    label: string;
}

interface CustomSelectProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: Option[];
    name: string;
    label?: string;
    placeholder?: string;
    error?: string;
    className?: string;
    required?: boolean;
    disabled?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
    value,
    onChange,
    options,
    name,
    label,
    placeholder = "Select an option",
    error,
    className = "",
    required = false,
    disabled = false
}) => {
    return (
        <div className={`flex flex-col ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="relative">
                <select
                    name={name}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className={`block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm appearance-none bg-white transition-colors ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                        } ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`}
                >
                    <option value="" disabled hidden>{placeholder}</option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                    <ChevronDown className="h-4 w-4" />
                </div>
            </div>
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
};

export default CustomSelect;
