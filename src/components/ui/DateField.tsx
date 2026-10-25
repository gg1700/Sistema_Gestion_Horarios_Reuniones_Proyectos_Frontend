import { useCallback, useRef, useState } from 'react';
import { FiAlertCircle, FiCalendar, FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import useOutsideClick from '../../hooks/useOutsideClick';
import {
  formatDisplayDate,
  getCalendarDays,
  getMonthName,
  getTodayIsoDate,
  parseIsoDate,
  weekDayNames,
} from '../../utils/calendar';

interface DateFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  isRequired?: boolean;
  minimumDate?: string;
  maximumDate?: string;
}

interface VisibleMonth {
  year: number;
  month: number;
}

function getInitialMonth(value: string): VisibleMonth {
  const date = parseIsoDate(value) ?? new Date();
  return { year: date.getFullYear(), month: date.getMonth() };
}

function moveMonth(visibleMonth: VisibleMonth, monthsToMove: number): VisibleMonth {
  const date = new Date(visibleMonth.year, visibleMonth.month + monthsToMove, 1);
  return { year: date.getFullYear(), month: date.getMonth() };
}

const navigationButtonClassName =
  'flex h-8 w-8 items-center justify-center rounded-md text-orbita-muted hover:bg-orbita-surface hover:text-orbita-text';

function DateField({
  label,
  name,
  value,
  onChange,
  error,
  isRequired = false,
  minimumDate,
  maximumDate = getTodayIsoDate(),
}: DateFieldProps) {
  const containerReference = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState<VisibleMonth>(() => getInitialMonth(value));
  const today = getTodayIsoDate();
  const hasError = Boolean(error);

  const closeCalendar = useCallback(() => setIsOpen(false), []);
  useOutsideClick(containerReference, isOpen, closeCalendar);

  function openCalendar() {
    setVisibleMonth(getInitialMonth(value));
    setIsOpen(true);
  }

  function isOutOfRange(isoDate: string) {
    return Boolean((minimumDate && isoDate < minimumDate) || (maximumDate && isoDate > maximumDate));
  }

  function selectDate(isoDate: string) {
    if (isOutOfRange(isoDate)) return;
    onChange(isoDate);
    setIsOpen(false);
  }

  const borderColor = hasError
    ? 'border-orbita-error'
    : isOpen
      ? 'border-orbita-accent'
      : 'border-orbita-outline hover:border-orbita-muted/60';

  return (
    <div ref={containerReference} className="relative flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-orbita-text">
        {label}
        {isRequired && (
          <span className="ml-0.5 text-orbita-error" aria-hidden="true">
            *
          </span>
        )}
      </label>

      <button
        id={name}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-invalid={hasError}
        onClick={() => (isOpen ? setIsOpen(false) : openCalendar())}
        onKeyDown={(event) => event.key === 'Escape' && setIsOpen(false)}
        className={`flex h-11 w-full items-center justify-between gap-2 rounded-lg border bg-orbita-surface px-3 text-left text-sm transition-colors ${borderColor}`}
      >
        <span className={value ? 'text-orbita-text' : 'text-orbita-disabled'}>
          {value ? formatDisplayDate(value) : 'Selecciona una fecha'}
        </span>
        <FiCalendar className={isOpen ? 'text-orbita-accent' : 'text-orbita-muted'} aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label={`Calendario de ${label}`}
          className="absolute top-full left-0 z-30 mt-1 w-72 rounded-lg border border-orbita-outline bg-orbita-card p-3 shadow-2xl"
        >
          <div className="mb-2 flex items-center justify-between">
            <div className="flex">
              <button type="button" aria-label="Año anterior" onClick={() => setVisibleMonth(moveMonth(visibleMonth, -12))} className={navigationButtonClassName}>
                <FiChevronsLeft aria-hidden="true" />
              </button>
              <button type="button" aria-label="Mes anterior" onClick={() => setVisibleMonth(moveMonth(visibleMonth, -1))} className={navigationButtonClassName}>
                <FiChevronLeft aria-hidden="true" />
              </button>
            </div>
            <span className="font-heading text-sm font-semibold text-orbita-text">
              {getMonthName(visibleMonth.month)} {visibleMonth.year}
            </span>
            <div className="flex">
              <button type="button" aria-label="Mes siguiente" onClick={() => setVisibleMonth(moveMonth(visibleMonth, 1))} className={navigationButtonClassName}>
                <FiChevronRight aria-hidden="true" />
              </button>
              <button type="button" aria-label="Año siguiente" onClick={() => setVisibleMonth(moveMonth(visibleMonth, 12))} className={navigationButtonClassName}>
                <FiChevronsRight aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {weekDayNames.map((weekDayName) => (
              <span key={weekDayName} className="py-1 font-code text-[11px] text-orbita-muted">
                {weekDayName}
              </span>
            ))}
            {getCalendarDays(visibleMonth.year, visibleMonth.month).map((day) => {
              const isSelected = day.isoDate === value;
              const isDisabled = isOutOfRange(day.isoDate);
              const isToday = day.isoDate === today;
              return (
                <button
                  key={day.isoDate}
                  type="button"
                  disabled={isDisabled}
                  aria-label={formatDisplayDate(day.isoDate)}
                  aria-pressed={isSelected}
                  onClick={() => selectDate(day.isoDate)}
                  className={`flex h-8 items-center justify-center rounded-md text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
                    isSelected
                      ? 'bg-orbita-accent font-medium text-orbita-on-primary'
                      : day.isCurrentMonth
                        ? 'text-orbita-text hover:bg-orbita-surface'
                        : 'text-orbita-disabled hover:bg-orbita-surface'
                  } ${isToday && !isSelected ? 'border border-orbita-primary/60' : ''}`}
                >
                  {day.dayNumber}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-orbita-outline pt-2">
            <button
              type="button"
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className="rounded-md px-2 py-1 text-xs text-orbita-muted hover:bg-orbita-surface hover:text-orbita-text"
            >
              Borrar
            </button>
            {!isOutOfRange(today) && (
              <button
                type="button"
                onClick={() => selectDate(today)}
                className="rounded-md px-2 py-1 text-xs font-medium text-orbita-accent hover:bg-orbita-surface"
              >
                Hoy
              </button>
            )}
          </div>
        </div>
      )}

      {hasError && (
        <p className="flex items-center gap-1.5 text-xs text-orbita-error">
          <FiAlertCircle aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

export default DateField;
