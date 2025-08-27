// src/hooks/usePagination.js
import { useState, useMemo } from 'react';

const usePagination = (data = [], itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  const maxPage = Math.ceil(data.length / itemsPerPage);

  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return data.slice(start, end);
  }, [currentPage, data, itemsPerPage]);

  const next = () => setCurrentPage((page) => Math.min(page + 1, maxPage));
  const prev = () => setCurrentPage((page) => Math.max(page - 1, 1));
  const jump = (page) => {
    const pageNumber = Math.max(1, page);
    setCurrentPage(() => Math.min(pageNumber, maxPage));
  };

  return { currentData, currentPage, maxPage, next, prev, jump };
};

export default usePagination;
