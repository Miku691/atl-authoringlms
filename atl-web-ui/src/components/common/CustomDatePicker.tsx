import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import * as Popover from "@radix-ui/react-popover";
import { Calendar } from "./Calendar";

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
  maxDate?: Date;
  minDate?: Date;
  showMonthDropdown?: boolean;
  showYearDropdown?: boolean;
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
  showYearDropdown = false
}) => {
  // Handle string dates from older components
  const date = typeof selectedDate === 'string' ? (selectedDate ? new Date(selectedDate) : null) : selectedDate;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <label className="text-xs font-black text-gray-400 uppercase ml-1 tracking-widest leading-none mb-1">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            type="button"
            className={cn(
              "w-full flex items-center justify-between pl-4 pr-4 py-3.5 bg-white rounded-lg border transition-all duration-200 outline-none text-sm font-medium",
              "border-gray-200 hover:border-[#2A6DF4]/40 focus-visible:border-[#2A6DF4] focus-visible:ring-4 focus-visible:ring-[#2A6DF4]/10",
              !date && "text-gray-400",
              error && "border-rose-500 ring-4 ring-red-50"
            )}
          >
            <div className="flex items-center gap-3">
              <CalendarIcon className={cn("h-5 w-5 transition-colors", date ? "text-[#2A6DF4]" : "text-gray-400")} />
              <span className={cn("font-medium", date ? "text-gray-900" : "text-gray-400")}>
                {date ? format(date, "PPP") : placeholderText}
              </span>
            </div>
            <div
              className="w-2 h-2 rounded-full transition-colors"
              style={{ background: date ? '#2A6DF4' : '#E2E8F8' }}
            />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            className="z-[200] min-w-[300px] bg-white rounded-[16px] p-4 shadow-[0_16px_48px_rgba(42,109,244,0.14)] border border-[#E2E8F8] animate-in fade-in zoom-in-95 duration-150"
            align="start"
            sideOffset={8}
          >
            <Calendar
              mode="single"
              selected={date || undefined}
              onSelect={(d) => {
                onChange(d || null);
              }}
              captionLayout={showYearDropdown ? "dropdown" : "label"}
              startMonth={showYearDropdown ? new Date(1900, 0) : undefined}
              endMonth={showYearDropdown ? new Date(new Date().getFullYear() + 10, 11) : undefined}
              disabled={(d: Date) => {
                if (minDate && d < minDate) return true;
                if (maxDate && d > maxDate) return true;
                return false;
              }}
              autoFocus
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      {error && <p className="mt-1 text-xs text-rose-600 font-bold ml-1">{error}</p>}
    </div>
  );
};

export default CustomDatePicker;
