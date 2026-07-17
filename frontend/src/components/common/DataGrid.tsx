import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  cell: (item: T) => ReactNode;
  width?: string;
  className?: string;
}

export interface DataGridProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  className?: string;
  emptyMessage?: string;
}

export function DataGrid<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  className,
  emptyMessage = "No data available",
}: DataGridProps<T>) {
  if (data.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-full min-h-[100px] text-tactical-400 font-mono text-sm", className)}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn("w-full overflow-auto", className)}>
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="sticky top-0 bg-tactical-900 border-b border-tactical-600 shadow-sm z-10">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn("px-4 py-2 font-mono text-xs text-tactical-400 uppercase tracking-wider", col.className)}
                style={{ width: col.width }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-tactical-600/50">
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              onClick={() => onRowClick?.(item)}
              className={cn(
                "group transition-colors duration-150",
                onRowClick ? "cursor-pointer hover:bg-tactical-700/50" : ""
              )}
            >
              {columns.map((col) => (
                <td key={col.key} className={cn("px-4 py-2.5 text-tactical-100", col.className)}>
                  {col.cell(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
