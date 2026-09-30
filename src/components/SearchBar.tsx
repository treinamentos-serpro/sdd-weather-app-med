import { type FormEvent, useState } from 'react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
}

export default function SearchBar({ onSearch, disabled = false }: SearchBarProps) {
  const [city, setCity] = useState('');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedCity = city.trim();
    if (!trimmedCity) {
      setValidationMessage('Digite o nome de uma cidade para buscar.');
      return;
    }

    if (disabled) {
      return;
    }

    setValidationMessage(null);
    onSearch(trimmedCity);
  }

  return (
    <form
      aria-label="Buscar cidade"
      className="flex w-full flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-glass backdrop-blur-md sm:flex-row sm:items-end"
      onSubmit={handleSubmit}
      role="search"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <label className="text-sm font-medium text-white" htmlFor="city-search">
          Cidade
        </label>
        <input
          className="w-full rounded-xl border border-white/10 bg-night-800/80 px-4 py-3 text-white outline-none transition placeholder:text-white/70 focus:border-accent-400 focus:ring-2 focus:ring-accent-400/40 disabled:cursor-not-allowed disabled:opacity-60"
          aria-describedby={validationMessage ? 'city-search-error' : undefined}
          aria-invalid={validationMessage ? 'true' : 'false'}
          disabled={disabled}
          id="city-search"
          name="city"
          onChange={(event) => {
            setCity(event.target.value);
            setValidationMessage(null);
          }}
          placeholder="Digite o nome da cidade"
          type="search"
          value={city}
        />
        {validationMessage && (
          <p className="text-sm text-amber-200" id="city-search-error" role="alert">
            {validationMessage}
          </p>
        )}
      </div>
      <button
        className="rounded-xl bg-accent-500 px-5 py-3 font-semibold text-white transition hover:bg-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-night-900 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={disabled}
        type="submit"
      >
        Buscar
      </button>
    </form>
  );
}
