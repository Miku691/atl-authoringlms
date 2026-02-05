import React from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from 'lucide-react';

interface CustomDatePickerProps {
    selectedDate: Date | null;
    onChange: (date: Date | null) => void;
    label?: string;
    placeholderText?: string;
    error?: string;
    className?: string;
    required?: boolean;
    maxDate?: Date;
    minDate?: Date;
    showMonthDropdown?: boolean;
    showYearDropdown?: boolean;
    dropdownMode?: 'scroll' | 'select';
    scrollableYearDropdown?: boolean;
    yearDropdownItemNumber?: number;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
    selectedDate,
    onChange,
    label,
    placeholderText = "Select date",
    error,
    className = "",
    required = false,
    maxDate,
    minDate,
    showMonthDropdown = true,
    showYearDropdown = true,
    dropdownMode = "select",
    scrollableYearDropdown = false,
    yearDropdownItemNumber
}) => {
    return (
        <div className={`flex flex-col ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className={`relative`}>
                <DatePicker
                    selected={selectedDate}
                    onChange={onChange}
                    placeholderText={placeholderText}
                    wrapperClassName="w-full"
                    className={`w-full pl-3 pr-10 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                        }`}
                    dateFormat="yyyy-MM-dd"
                    maxDate={maxDate}
                    minDate={minDate}
                    showMonthDropdown={showMonthDropdown}
                    showYearDropdown={showYearDropdown}
                    dropdownMode={dropdownMode}
                    scrollableYearDropdown={scrollableYearDropdown}
                    yearDropdownItemNumber={yearDropdownItemNumber}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                    <Calendar className="w-4 h-4" />
                </div>
            </div>
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
};

export default CustomDatePicker;
