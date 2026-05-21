import React from 'react';
import { ShieldCheck, Sun, Moon, LogOut } from 'lucide-react';
import SearchBar from './SearchBar';
import { ternaryHelper, orHelper } from '../utils/helpers';

const Header = ({
  search,
  setSearch,
  toggleTheme,
  isDarkMode,
  user,
  handleLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shadow-md shadow-primary-500/25">
            <ShieldCheck className="w-5.5 h-5.5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white hidden sm:block">
            SecureNotes
          </span>
        </div>

        <SearchBar value={search} onChange={setSearch} />

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-slate-200/50 hover:bg-slate-50 dark:border-slate-800/50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
            title="Toggle theme"
          >
            {ternaryHelper(isDarkMode, <Sun className="w-4.5 h-4.5" />, <Moon className="w-4.5 h-4.5" />)}
          </button>

          <div className="hidden md:flex flex-col items-end pr-2 text-right">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {orHelper(user?.name, 'User')}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Encrypted Session</span>
          </div>

          <button
            onClick={handleLogout}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/80 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1.5"
            title="Logout"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span className="text-sm font-semibold hidden md:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
