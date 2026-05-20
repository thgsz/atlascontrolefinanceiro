import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthSelectorProps {
  month: number;
  year: number;
  onMonthChange: (month: number, year: number) => void;
}

const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export function MonthSelector({ month, year, onMonthChange }: MonthSelectorProps) {
  const handlePrevious = () => {
    if (month === 1) {
      onMonthChange(12, year - 1);
    } else {
      onMonthChange(month - 1, year);
    }
  };

  const handleNext = () => {
    if (month === 12) {
      onMonthChange(1, year + 1);
    } else {
      onMonthChange(month + 1, year);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handlePrevious}
        className="p-2 rounded-lg hover:bg-secondary transition-colors"
      >
        <ChevronLeft className="w-5 h-5 text-muted-foreground" />
      </button>

      <div className="text-center min-w-[160px]">
        <span className="font-display font-semibold text-lg">
          {months[month - 1]} {year}
        </span>
      </div>

      <button
        onClick={handleNext}
        className="p-2 rounded-lg hover:bg-secondary transition-colors"
      >
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </button>
    </div>
  );
}
