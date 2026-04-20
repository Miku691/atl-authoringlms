import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, type DayPickerProps } from "react-day-picker";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export type CalendarProps = DayPickerProps;

const Calendar = ({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) => {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-1", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-3",
        month_caption: "flex justify-center pt-1 pb-2 relative items-center",
        caption_label: "text-[14px] font-bold text-[#0F1D3A] tracking-tight",
        nav: "space-x-1 flex items-center absolute right-0 top-1",
        button_previous: cn(
          "h-7 w-7 bg-white border border-[#E2E8F8] shadow-sm p-0 opacity-100 hover:bg-[#EBF1FE] hover:border-[#2A6DF4] rounded-[8px] flex items-center justify-center transition-all z-10"
        ),
        button_next: cn(
          "h-7 w-7 bg-white border border-[#E2E8F8] shadow-sm p-0 opacity-100 hover:bg-[#EBF1FE] hover:border-[#2A6DF4] rounded-[8px] flex items-center justify-center transition-all z-10"
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex justify-between mb-1",
        weekday: "text-[#8FA3C0] rounded-md w-9 font-bold text-[0.6rem] uppercase tracking-widest text-center",
        week: "flex w-full mt-1 justify-between",
        day: cn(
          "h-9 w-9 p-0 font-semibold aria-selected:opacity-100 rounded-[8px] hover:bg-[#EBF1FE] hover:text-[#2A6DF4] transition-all flex items-center justify-center text-[13px] text-[#0F1D3A]"
        ),
        selected:
          "!bg-[#2A6DF4] !text-white hover:!bg-[#1A5CE0] hover:!text-white focus:!bg-[#2A6DF4] focus:!text-white shadow-md shadow-[rgba(42,109,244,0.30)] rounded-[8px]",
        today: "bg-[#EBF1FE] text-[#2A6DF4] font-bold border border-[#2A6DF4]/20",
        outside: "!text-[#8FA3C0] opacity-30",
        disabled: "text-[#8FA3C0] opacity-20 cursor-not-allowed",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight;
          return <Icon className="h-3.5 w-3.5 text-[#5A6B88]" />;
        },
      }}
      {...props}
    />
  );
};

Calendar.displayName = "Calendar";

export { Calendar };
