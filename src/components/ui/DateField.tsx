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
} from '../../utils/calendarGrid';

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
  'flex h-8 w-8 items-center justify-center rounded-md text-ui-muted hover:bg-ui-hover hover:text-ui-text';

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
    ? 'border-ui-danger'
    : isOpen
      ? 'border-ui-mint'
      : 'border-ui-field-border hover:border-ui-soft';

  return (
    <div ref={containerReference} className="relative flex flex-col gap-2">
      <label htmlFor={name} className="text-xs font-medium text-ui-text">
        {label}
        {isRequired && (
          <span className="ml-0.5 text-ui-mint" aria-hidden="true">
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
        className={`flex h-[3.25rem] w-full items-center justify-between gap-2 rounded-control border bg-ui-field px-4 text-left text-sm transition-colors ${borderColor}`}
      >
        <span className={value ? 'text-ui-text' : 'text-ui-soft'}>
          {value ? formatDisplayDate(value) : 'Selecciona una fecha'}
        </span>
        <FiCalendar className={isOpen ? 'text-ui-mint' : 'text-ui-muted'} aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label={`Calendario de ${label}`}
          className="absolute top-full left-0 z-30 mt-1 w-72 rounded-control border border-ui-border bg-ui-raised p-3 shadow-2xl"
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
            <span className="font-heading text-sm font-semibold text-ui-text">
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
              <span key={weekDayName} className="py-1 font-code text-[11px] text-ui-muted">
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
                      ? 'bg-ui-mint font-medium text-ui-ink'
                      : day.isCurrentMonth
                        ? 'text-ui-text hover:bg-ui-hover'
                        : 'text-ui-soft hover:bg-ui-hover'
                  } ${isToday && !isSelected ? 'border border-ui-mint/60' : ''}`}
                >
                  {day.dayNumber}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-ui-border pt-2">
            <button
              type="button"
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className="rounded-md px-2 py-1 text-xs text-ui-muted hover:bg-ui-hover hover:text-ui-text"
            >
              Borrar
            </button>
            {!isOutOfRange(today) && (
              <button
                type="button"
                onClick={() => selectDate(today)}
                className="rounded-md px-2 py-1 text-xs font-medium text-ui-mint hover:bg-ui-hover"
              >
                Hoy
              </button>
            )}
          </div>
        </div>
      )}

      {hasError && (
        <p className="flex items-center gap-1.5 text-[11px] text-ui-danger">
          <FiAlertCircle aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

export default DateField;
