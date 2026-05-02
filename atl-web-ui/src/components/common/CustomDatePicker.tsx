import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

interface CustomDatePickerProps {
  selectedDate: Date | null | string;
  onChange: (date: Date | null) => void;
  label?: string;
  placeholderText?: string;
  error?: string;
  className?: string;
  required?: boolean;
  maxDate?: Date | string;
  minDate?: Date | string;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  selectedDate,
  onChange,
  label,
  placeholderText = "Select date",
  error,
  className = "",
  required = false,
  minDate,
  maxDate,
}) => {
  // Normalize date to YYYY-MM-DD string for native input
  const getStringValue = (d: Date | string | null | undefined): string => {
    if (!d) return "";
    const dateObj = typeof d === 'string' ? new Date(d) : d;
    if (isNaN(dateObj.getTime())) return "";
    return format(dateObj, "yyyy-MM-dd");
  };

  const stringValue = getStringValue(selectedDate);
  const minStr = getStringValue(minDate);
  const maxStr = getStringValue(maxDate);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) {
      onChange(null);
    } else {
      // Create date at midnight local time to avoid timezone shifts
      const [year, month, day] = val.split('-').map(Number);
      const newDate = new Date(year, month - 1, day);
      onChange(newDate);
    }
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-[10px] font-bold text-content-muted uppercase ml-1 tracking-widest leading-none mb-0.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-brand text-content-muted">
          <CalendarIcon className="h-4 w-4" />
        </div>
        <input
          type="date"
          className={cn(
            "w-full pl-11 pr-4 py-3 bg-surface rounded-xl border transition-all duration-200 outline-none text-sm font-medium [color-scheme:dark]",
            "border-border hover:border-brand/40 focus:border-brand focus:ring-4 focus:ring-brand/10 text-content-primary",
            !stringValue && "text-content-muted",
            error && "border-rose-500 ring-4 ring-rose-50 dark:ring-rose-500/10"
          )}
          value={stringValue}
          min={minStr}
          max={maxStr}
          onChange={handleChange}
          required={required}
        />
        {/* Shadow indicator for value presence */}
        <div
          className={cn(
            "absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full transition-colors",
            stringValue ? "bg-brand" : "bg-chrome"
          )}
        />
      </div>
      {error && <p className="mt-1 text-[10px] text-rose-600 font-bold ml-1">{error}</p>}
    </div>
  );
};

export default CustomDatePicker;
