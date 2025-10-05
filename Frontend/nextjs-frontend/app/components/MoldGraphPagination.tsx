"use client";

import React from "react";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (count: number) => void;
  itemsPerPageOptions?: number[];
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [5, 10, 20, 50],
}) => {
  const totalPages = Math.ceil((totalItems || 0) / (itemsPerPage || 1));
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="flex items-center justify-between flex-wrap gap-3 mt-4">
      {/* Page buttons */}
      <ul className="flex items-center space-x-1">
        <li>
          <button
            className={`px-3 py-1 border rounded ${
              currentPage === 1
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-200"
            }`}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            «
          </button>
        </li>

        {pages.map((p) => (
          <li key={p}>
            <button
              onClick={() => onPageChange(p)}
              className={`px-3 py-1 border rounded ${
                currentPage === p
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-200"
              }`}
            >
              {p}
            </button>
          </li>
        ))}

        <li>
          <button
            className={`px-3 py-1 border rounded ${
              currentPage === totalPages
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-200"
            }`}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            »
          </button>
        </li>
      </ul>

      {/* Items per page dropdown */}
      <div className="flex items-center space-x-2">
        <label htmlFor="itemsPerPage" className="text-sm">
          Items per page:
        </label>
        <select
          id="itemsPerPage"
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="border rounded px-2 py-1 bg-white text-black dark:bg-black dark:text-white dark:border-white"
        >
          {itemsPerPageOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    </nav>
  );
};

export default Pagination;
