
import React from 'react';

interface SuggestionChipsProps {
  suggestions: string[];
  onSelectSuggestion: (suggestion: string) => void;
  disabled: boolean;
}

const SuggestionChips: React.FC<SuggestionChipsProps> = ({ suggestions, onSelectSuggestion, disabled }) => {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap justify-center gap-2 px-4 sm:px-6 pt-3 pb-1">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSelectSuggestion(suggestion)}
          disabled={disabled}
          className="px-4 py-2 text-sm font-semibold bg-violet-50 text-[var(--color-primary-start)] rounded-full border-2 border-violet-200 hover:bg-violet-100 hover:border-violet-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--color-primary-start)] transition-all duration-200 animate-fade-in disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
};

export default SuggestionChips;