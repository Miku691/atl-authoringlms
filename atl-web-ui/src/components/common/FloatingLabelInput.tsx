import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface FloatingLabelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon?: React.ReactNode;
    error?: string;
    inputClassName?: string;
}

const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
    label,
    icon,
    error,
    inputClassName = '',
    type = 'text',
    className = '',
    value,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const hasValue = value !== '' && value !== undefined;

    const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

    return (
        <div className={`relative mb-1 ${className}`}>
            <div
                className={`
                    relative rounded-lg border transition-all duration-200 h-full
                    ${error
                        ? 'border-red-500 ring-4 ring-red-50 dark:ring-red-500/10 focus-within:ring-red-100 dark:focus-within:ring-red-500/20 focus-within:border-red-600 shadow-sm shadow-red-200/20'
                        : 'border-border focus-within:ring-4 focus-within:ring-indigo-50 dark:focus-within:ring-indigo-500/10 focus-within:border-indigo-500'
                    }
                    bg-surface
                `}
            >
                {/* Icon */}
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <div className={`transition-colors duration-200 ${isFocused || hasValue ? (error ? 'text-red-500' : 'text-indigo-500') : 'text-content-muted'}`}>
                            {icon}
                        </div>
                    </div>
                )}

                {/* Input */}
                <input
                    {...props}
                    type={inputType}
                    value={value}
                    className={`
                        block w-full rounded-lg bg-transparent border-none
                        ${icon ? 'pl-10' : 'pl-4'} 
                        pr-10 py-3.5 
                        text-content-primary placeholder-transparent focus:ring-0
                        ${inputClassName}
                    `}
                    placeholder={label} // Required for :placeholder-shown trick if we used CSS-only, but here using JS state
                    onFocus={(e) => {
                        setIsFocused(true);
                        props.onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setIsFocused(false);
                        props.onBlur?.(e);
                    }}
                />

                {/* Floating Label */}
                <label
                    className={`
                        absolute left-0 transition-all duration-200 pointer-events-none
                        ${icon ? 'left-10' : 'left-4'}
                        ${isFocused || hasValue
                            ? '-top-2 text-xs bg-surface px-1 text-indigo-600 dark:text-indigo-400 font-medium'
                            : 'top-3.5 text-content-secondary'
                        }
                    `}
                >
                    {label}
                </label>

                {/* Password Toggle */}
                {type === 'password' && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-content-muted hover:text-content-secondary focus:outline-none transition-colors"
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <p className="mt-1 text-xs text-red-500 pl-1">{error}</p>
            )}
        </div>
    );
};

export default FloatingLabelInput;
