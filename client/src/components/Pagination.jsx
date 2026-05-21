import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { andHelper, ternaryHelper } from '../utils/helpers';

const Pagination = ({
  pages = 1,
  currentPage = 1,
  total = 0,
  limit = 12,
  onPageChange,
  isLoading = false,
}) => {
  if (pages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-850 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {[...Array(pages)].map((_, index) => {
          const pageNum = index + 1;
          const isActive = currentPage === pageNum;

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              disabled={isLoading}
              className={`w-9 h-9 rounded-xl text-xs font-semibold transition-all ${ternaryHelper(
                isActive,
                'bg-primary-600 text-white shadow-md shadow-primary-500/20',
                'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-300 dark:border-slate-850'
              )}`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === pages || isLoading}
          className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-850 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
        Showing items {Math.min((currentPage - 1) * limit + 1, total)} - {Math.min(currentPage * limit, total)} of {total}
      </span>
    </div>
  );
};

export default Pagination;
