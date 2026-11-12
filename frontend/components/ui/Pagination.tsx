"use client";

import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { cn } from "@/lib/utils";

interface Props {
  page: number;
  pages: number;
  onChange: (page: number) => void;
}

/** Builds [1, "...", 4, 5, 6, "...", 20] style arrays */
function getPageNumbers(page: number, pages: number): (number | "...")[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);

  const result: (number | "...")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pages - 1, page + 1);

  if (start > 2) result.push("...");
  for (let i = start; i <= end; i++) result.push(i);
  if (end < pages - 1) result.push("...");
  result.push(pages);

  return result;
}

export default function Pagination({ page, pages, onChange }: Props) {
  if (pages <= 1) return null;

  const btn =
    "min-w-[40px] h-10 px-3 flex items-center justify-center rounded-lg text-sm font-medium transition-colors";

  return (
    <nav className="flex items-center justify-center gap-1.5 mt-10" aria-label="Pagination">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className={cn(btn, "bg-dark-800 text-dark-300 hover:bg-dark-700 disabled:opacity-40 disabled:cursor-not-allowed")}
      >
        <FiChevronLeft />
      </button>

      {getPageNumbers(page, pages).map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="px-2 text-dark-500">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={cn(
              btn,
              p === page
                ? "bg-primary-600 text-white shadow-glow"
                : "bg-dark-800 text-dark-300 hover:bg-dark-700"
            )}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === pages}
        className={cn(btn, "bg-dark-800 text-dark-300 hover:bg-dark-700 disabled:opacity-40 disabled:cursor-not-allowed")}
      >
        <FiChevronRight />
      </button>
    </nav>
  );
}