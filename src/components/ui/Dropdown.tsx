import { useCallback, useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { FiCheck, FiChevronDown } from 'react-icons/fi';
import useOutsideClick from '../../hooks/useOutsideClick';

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
  id?: string;
  placeholder?: string;
  hasError?: boolean;
  className?: string;
}

function Dropdown({
  value,
  options,
  onChange,
  ariaLabel,
  id,
  placeholder = 'Selecciona una opción',
  hasError = false,
  className = '',
}: DropdownProps) {
  const listId = useId();
  const containerReference = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const selectedOption = options.find((option) => option.value === value);

  const closeList = useCallback(() => setIsOpen(false), []);
  useOutsideClick(containerReference, isOpen, closeList);

  function openList() {
    const selectedIndex = options.findIndex((option) => option.value === value);
    setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setIsOpen(true);
  }

  function selectOption(option: DropdownOption) {
    onChange(option.value);
    setIsOpen(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'Escape') {
      setIsOpen(false);
      return;
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp' && event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    if (!isOpen) {
      openList();
      return;
    }
    if (event.key === 'ArrowDown') setHighlightedIndex((index) => Math.min(index + 1, options.length - 1));
    if (event.key === 'ArrowUp') setHighlightedIndex((index) => Math.max(index - 1, 0));
    if (event.key === 'Enter' || event.key === ' ') selectOption(options[highlightedIndex]);
  }

  const borderColor = hasError
    ? 'border-orbita-error'
    : isOpen
      ? 'border-orbita-accent'
      : 'border-orbita-outline hover:border-orbita-muted/60';

  return (
    <div ref={containerReference} className={`relative ${className}`}>
      <button
        id={id}
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-controls={listId}
        onClick={() => (isOpen ? setIsOpen(false) : openList())}
        onKeyDown={handleKeyDown}
        className={`flex h-11 w-full items-center justify-between gap-2 rounded-lg border bg-orbita-surface px-3 text-left text-sm transition-colors ${borderColor}`}
      >
        <span className={`truncate ${selectedOption ? 'text-orbita-text' : 'text-orbita-disabled'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <FiChevronDown
          className={`shrink-0 text-orbita-muted transition-transform ${isOpen ? 'rotate-180 text-orbita-accent' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <ul
          id={listId}
          role="listbox"
          aria-label={ariaLabel}
          className="orbita-scrollbar absolute top-full left-0 z-30 mt-1 max-h-60 w-full min-w-48 overflow-y-auto rounded-lg border border-orbita-outline bg-orbita-card p-1 shadow-2xl"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isHighlighted = index === highlightedIndex;
            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onPointerEnter={() => setHighlightedIndex(index)}
                onClick={() => selectOption(option)}
                className={`flex cursor-pointer items-center justify-between gap-2 rounded-md px-3 py-2 text-sm ${
                  isHighlighted ? 'bg-orbita-surface' : ''
                } ${isSelected ? 'text-orbita-accent' : 'text-orbita-text'}`}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && <FiCheck className="shrink-0" aria-hidden="true" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default Dropdown;
