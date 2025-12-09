import React from "react";
import Papa from "papaparse";
import { X, Upload, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import type {
  CSVImportRow,
  InventoryCategory,
  InventoryType,
  ImportValidationError,
} from "../types";
import { useInventoryStore } from "../store/inventoryStore";
import { inventoryService } from "../services/inventoryService";

interface ImportCSVProps {
  isOpen: boolean;
  onClose: () => void;
}

const VALID_CATEGORIES: InventoryCategory[] = [
  "Protein",
  "Vegetables",
  "Grains",
  "Sauces",
  "Toppings",
  "Beverages",
  "Packaging",
  "Supplies",
];

const VALID_TYPES: InventoryType[] = [
  "Entree",
  "Bowl",
  "Sides",
  "Appetizer",
  "Dessert",
  "Beverage",
  "Ingredient",
  "Supply",
];

export const ImportCSV: React.FC<ImportCSVProps> = ({ isOpen, onClose }) => {
  const { fetchItems } = useInventoryStore();
  const [file, setFile] = React.useState<File | null>(null);
  const [parsedData, setParsedData] = React.useState<CSVImportRow[]>([]);
  const [errors, setErrors] = React.useState<ImportValidationError[]>([]);
  const [isImporting, setIsImporting] = React.useState(false);
  const [importComplete, setImportComplete] = React.useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      alert("Please select a CSV file");
      return;
    }

    setFile(selectedFile);
    setImportComplete(false);

    // Parse CSV
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as CSVImportRow[];
        setParsedData(data);
        validateData(data);
      },
      error: (error) => {
        console.error("CSV parsing error:", error);
        alert("Failed to parse CSV file");
      },
    });
  };

  const validateData = (data: CSVImportRow[]) => {
    const validationErrors: ImportValidationError[] = [];

    data.forEach((row, index) => {
      const rowNum = index + 2; // +2 because row 1 is headers and arrays are 0-indexed

      if (!row.name || !row.name.trim()) {
        validationErrors.push({
          row: rowNum,
          field: "name",
          message: "Name is required",
        });
      }

      if (!row.code || !row.code.trim()) {
        validationErrors.push({
          row: rowNum,
          field: "code",
          message: "Code is required",
        });
      }

      if (
        !row.category ||
        !VALID_CATEGORIES.includes(row.category as InventoryCategory)
      ) {
        validationErrors.push({
          row: rowNum,
          field: "category",
          message: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(
            ", "
          )}`,
        });
      }

      if (!row.type || !VALID_TYPES.includes(row.type as InventoryType)) {
        validationErrors.push({
          row: rowNum,
          field: "type",
          message: `Invalid type. Must be one of: ${VALID_TYPES.join(", ")}`,
        });
      }
    });

    setErrors(validationErrors);
  };

  const handleImport = async () => {
    if (errors.length > 0) {
      alert("Please fix validation errors before importing");
      return;
    }

    setIsImporting(true);
    try {
      const items = parsedData.map((row) => ({
        name: row.name,
        code: row.code,
        category: row.category as InventoryCategory,
        type: row.type as InventoryType,
        description: row.description,
        status: (row.status as "Active" | "Discontinued") || "Active",
      }));

      await inventoryService.importItems(items);
      await fetchItems();
      setImportComplete(true);

      setTimeout(() => {
        onClose();
        resetState();
      }, 2000);
    } catch (error) {
      console.error("Import failed:", error);
      alert("Failed to import items");
    } finally {
      setIsImporting(false);
    }
  };

  const resetState = () => {
    setFile(null);
    setParsedData([]);
    setErrors([]);
    setImportComplete(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Import from CSV
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 rounded p-1"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!file ? (
            <div className="text-center py-12">
              <label className="inline-flex flex-col items-center cursor-pointer">
                <div className="w-16 h-16 mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                  <Upload size={32} className="text-blue-600" />
                </div>
                <span className="text-lg font-medium text-gray-900 mb-2">
                  Upload CSV File
                </span>
                <span className="text-sm text-gray-500 mb-4">
                  Click to select a CSV file to import
                </span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <span className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                  Select File
                </span>
              </label>

              <div className="mt-8 max-w-2xl mx-auto text-left">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  CSV Format:
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 text-xs font-mono overflow-x-auto">
                  <div className="text-gray-700">
                    name,code,category,type,description,status
                  </div>
                  <div className="text-gray-500">
                    Orange Chicken,ENT-ORC-001,Protein,Entree,Crispy
                    chicken,Active
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-600 space-y-1">
                  <p>
                    <strong>Required fields:</strong> name, code, category, type
                  </p>
                  <p>
                    <strong>Valid categories:</strong>{" "}
                    {VALID_CATEGORIES.join(", ")}
                  </p>
                  <p>
                    <strong>Valid types:</strong> {VALID_TYPES.join(", ")}
                  </p>
                </div>
              </div>
            </div>
          ) : importComplete ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Import Complete!
              </h3>
              <p className="text-sm text-gray-500">
                Successfully imported {parsedData.length} item
                {parsedData.length !== 1 ? "s" : ""}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {parsedData.length} row{parsedData.length !== 1 ? "s" : ""}{" "}
                    found
                  </p>
                </div>
                <button
                  onClick={resetState}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Choose Different File
                </button>
              </div>

              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle
                      className="text-red-600 flex-shrink-0"
                      size={20}
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-red-900 mb-2">
                        {errors.length} Validation Error
                        {errors.length !== 1 ? "s" : ""}
                      </h4>
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {errors.slice(0, 10).map((error, index) => (
                          <p key={index} className="text-xs text-red-700">
                            Row {error.row}, {error.field}: {error.message}
                          </p>
                        ))}
                        {errors.length > 10 && (
                          <p className="text-xs text-red-600 font-medium">
                            ...and {errors.length - 10} more errors
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Preview
                </h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                            Name
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                            Code
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                            Category
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                            Type
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {parsedData.slice(0, 50).map((row, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2">{row.name}</td>
                            <td className="px-4 py-2 font-mono text-xs">
                              {row.code}
                            </td>
                            <td className="px-4 py-2">{row.category}</td>
                            <td className="px-4 py-2">{row.type}</td>
                            <td className="px-4 py-2">
                              {row.status || "Active"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                {parsedData.length > 50 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Showing first 50 of {parsedData.length} rows
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {file && !importComplete && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={errors.length > 0 || isImporting}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isImporting && <Loader2 size={16} className="animate-spin" />}
              Import {parsedData.length} Item
              {parsedData.length !== 1 ? "s" : ""}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
