
import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface HintSuggestionsProps {
  suggestions: string[];
  isLoading: boolean;
  onSuggestionClick: (suggestion: string) => void;
  onClose: () => void;
}

const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

const HintSuggestions: React.FC<HintSuggestionsProps> = ({ suggestions, isLoading, onSuggestionClick, onClose }) => {
  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 p-4 bg-slate-700 rounded-lg shadow-xl border border-slate-600 z-20 max-h-48 overflow-y-auto">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-md font-semibold text-sky-400">Need a little help?</h4>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-100">
            <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-20">
            <LoadingSpinner size="sm" text="Getting suggestions..." />
        </div>
      ) : suggestions.length > 0 ? (
        <ul className="space-y-2">
          {suggestions.map((hint, index) => (
            <li key={index}>
              <button
                onClick={() => onSuggestionClick(hint)}
                className="w-full text-left p-2 bg-slate-600 hover:bg-sky-600 rounded text-sm text-slate-200 hover:text-white transition-colors"
              >
                {hint}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-400 text-center py-4">No suggestions available right now. Try rephrasing or ask the AI for help directly!</p>
      )}
    </div>
  );
};

export default HintSuggestions;
