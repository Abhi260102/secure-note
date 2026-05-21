import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ value, onChange, placeholder = 'Search notes by title...' }) => {
  return (
    <div className="flex-1 max-w-xl relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="w-4 h-4 text-slate-400" />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e?.target?.value)}
        className="w-full pl-10 pr-4 py-2 bg-slate-100 hover:bg-slate-200/60 dark:bg-slate-800 dark:hover:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-900 border border-transparent focus:border-primary-500/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/10 transition-all"
      />
    </div>
  );
};

export default SearchBar;
