import { useState, useEffect } from 'react';

export const useSearch = (initialValue = '', delay = 400, onSearch) => {
  const [search, setSearch] = useState(initialValue);
  const [debouncedSearch, setDebouncedSearch] = useState(initialValue);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      if (onSearch) {
        onSearch(search);
      }
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [search, delay]);

  return {
    search,
    setSearch,
    debouncedSearch,
  };
};
