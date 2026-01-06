import { Search, X } from "lucide-react";

interface FilterOption {
  label: string;
  value: string;
}

interface AdminFilterComponentProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  filterOptions?: Record<string, (string | FilterOption)[]>;
}

const AdminFilterComponent = ({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = {},
  onFilterChange,
  filterOptions = {},
}: AdminFilterComponentProps) => {
  // Helper to get label and value from option
  const getOptionData = (option: string | FilterOption) => {
    if (typeof option === "string") {
      return { label: option, value: option };
    }
    return option;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border mb-6">
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${
          1 + Object.keys(filterOptions).length
        } gap-4`}
      >
        <div className="relative">
          {/* Search Input */}
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg 
               focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
               outline-none transition-shadow"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 
                 text-gray-400 hover:text-gray-600 transition"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {Object.entries(filterOptions).map(([key, options]) => (
          <div key={key}>
            <select
              value={filters[key] || ""}
              onChange={(e) =>
                onFilterChange && onFilterChange(key, e.target.value)
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow capitalize"
            >
              <option value="">
                All {key.charAt(0).toUpperCase() + key.slice(1)}
              </option>
              {options.map((option, idx) => {
                const { label, value } = getOptionData(option);
                return (
                  <option key={`${key}-${value}-${idx}`} value={value}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminFilterComponent;
