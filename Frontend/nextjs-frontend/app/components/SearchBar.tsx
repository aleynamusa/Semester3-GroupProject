'use client';

import { useState, useRef } from 'react';

type Props = {
  onSearch: (term: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
};

export default function SearchBar({
  onSearch,
  onClear,
  placeholder = 'Search mold by name…',
  className = '',
}: Props) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = value.trim();
    if (term) onSearch(term);
  };

  const clear = () => {
    setValue('');
    onClear?.();
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={submit} className={`relative ${className}`}>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-64 md:w-80 rounded-full border border-neutral-400 bg-white px-4 py-2 pr-20 text-sm text-neutral-900 placeholder:text-neutral-500 
          focus:outline-none focus:ring-2 focus:ring-neutral-500 
          dark:bg-[var(--background)] dark:text-[var(--foreground)] dark:placeholder:text-neutral-400 dark:border-neutral-600 dark:focus:ring-neutral-400"
      />

      {/* butonu x */}
      {onClear && value && (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          title="Clear"
          className="absolute right-12 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full border border-neutral-400 bg-neutral-200 p-2 text-neutral-700 hover:bg-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-500"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      )}

      {/* buton dragut*/}
      <button
        type="submit"
        aria-label="Search"
        title="Search"
        className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full border border-neutral-400 bg-neutral-200 p-2 text-neutral-700 hover:bg-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-500"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M21 21l-4.2-4.2m1.2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </form>
  );
}
