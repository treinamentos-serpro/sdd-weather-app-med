import { type KeyboardEvent, useRef } from 'react';

import type { Unit } from '../types/weather';

interface UnitToggleProps {
  unit: Unit;
  onChange: (unit: Unit) => void;
}

const units: ReadonlyArray<{ label: string; value: Unit }> = [
  { label: '°C', value: 'celsius' },
  { label: '°F', value: 'fahrenheit' },
];

export default function UnitToggle({ unit, onChange }: UnitToggleProps) {
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | undefined;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (index + 1) % units.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (index - 1 + units.length) % units.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = units.length - 1;
    }

    if (nextIndex === undefined) {
      return;
    }

    event.preventDefault();
    const nextUnit = units[nextIndex];
    onChange(nextUnit.value);
    buttonRefs.current[nextIndex]?.focus();
  }

  return (
    <div
      aria-label="Unidade de temperatura"
      className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1 shadow-glass backdrop-blur-md"
      role="group"
    >
      {units.map((option, index) => {
        const isActive = option.value === unit;
        const buttonClassName = isActive
          ? 'min-w-12 rounded-lg bg-accent-500/25 px-3 py-2 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-night-900'
          : 'min-w-12 rounded-lg px-3 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-night-900';

        return (
          <button
            aria-pressed={isActive}
            className={buttonClassName}
            key={option.value}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            ref={(element) => {
              buttonRefs.current[index] = element;
            }}
            tabIndex={isActive ? 0 : -1}
            type="button"
          >
            <span className={isActive ? 'text-accent-400' : 'text-white/70'}>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
