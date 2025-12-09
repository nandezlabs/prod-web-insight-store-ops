import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { InventoryItem } from "../types";
import { useInventoryStore } from "../store/inventoryStore";

const columnHelper = createColumnHelper<InventoryItem>();

interface InventoryTableProps {
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  onEdit,
  onDelete,
}) => {
  const {
    selectedItems,
    toggleSelectItem,
    toggleSelectAll,
    getPaginatedItems,
    getFilteredItems,
    currentPage,
    pageSize,
    setPage,
    isLoading,
  } = useInventoryStore();

  const [sorting, setSorting] = React.useState<SortingState>([]);

  const data = getPaginatedItems();
  const filteredData = getFilteredItems();
  const totalPages = Math.ceil(filteredData.length / pageSize);

  const columns = [
    columnHelper.display({
      id: "select",
      header: () => {
        const allSelected = data.every((item) =>
          selectedItems.includes(item.id)
        );
        return (
          <input
            type="checkbox"
            checked={allSelected && data.length > 0}
            onChange={toggleSelectAll}
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            aria-label="Select all items"
          />
        );
      },
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedItems.includes(row.original.id)}
          onChange={() => toggleSelectItem(row.original.id)}
          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          aria-label={`Select ${row.original.name}`}
        />
      ),
      size: 50,
    }),
    columnHelper.accessor("name", {
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting()}
          className="flex items-center gap-2 font-medium hover:text-gray-900"
        >
          Item Name
          <ArrowUpDown size={14} />
        </button>
      ),
      cell: (info) => (
        <div className="font-medium text-gray-900">{info.getValue()}</div>
      ),
    }),
    columnHelper.accessor("code", {
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting()}
          className="flex items-center gap-2 font-medium hover:text-gray-900"
        >
          Item Code
          <ArrowUpDown size={14} />
        </button>
      ),
      cell: (info) => (
        <div className="text-sm text-gray-600 font-mono">{info.getValue()}</div>
      ),
    }),
    columnHelper.accessor("category", {
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting()}
          className="flex items-center gap-2 font-medium hover:text-gray-900"
        >
          Category
          <ArrowUpDown size={14} />
        </button>
      ),
      cell: (info) => (
        <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("type", {
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting()}
          className="flex items-center gap-2 font-medium hover:text-gray-900"
        >
          Type
          <ArrowUpDown size={14} />
        </button>
      ),
      cell: (info) => (
        <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("status", {
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting()}
          className="flex items-center gap-2 font-medium hover:text-gray-900"
        >
          Status
          <ArrowUpDown size={14} />
        </button>
      ),
      cell: (info) => {
        const status = info.getValue();
        const colors = {
          Active: "bg-green-100 text-green-700",
          "Pending Delete": "bg-red-100 text-red-700",
          Discontinued: "bg-gray-100 text-gray-700",
        };
        return (
          <span
            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${colors[status]}`}
          >
            {status}
          </span>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(row.original)}
            className="p-1 text-gray-600 hover:text-blue-600 rounded transition-colors"
            aria-label={`Edit ${row.original.name}`}
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(row.original)}
            className="p-1 text-gray-600 hover:text-red-600 rounded transition-colors"
            aria-label={`Delete ${row.original.name}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
      size: 100,
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="animate-pulse space-y-4 p-4">
          <div className="h-10 bg-gray-200 rounded" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No items found
        </h3>
        <p className="text-gray-500">
          Try adjusting your filters or add a new item
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-gray-200 bg-gray-50"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
            {filteredData.length} items
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
              aria-label="Next page"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
