import { useEffect, useRef, useState } from "react";
import { usePopper } from "react-popper";
import Fuse from "fuse.js";
import useWidth from "lib/useWidth";

export interface DropdownSearchProps {
  data: string[];
  placeholder?: string;
  onAdd?: (gpu: string) => void;
}

const DropdownSearch: React.FC<DropdownSearchProps> = ({
  data,
  placeholder,
  onAdd,
}) => {
  const popperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const width = useWidth(inputRef);

  const { styles: popperStyles, attributes: popperAttributes } = usePopper(
    inputRef.current,
    popperRef.current,
    {
      placement: "bottom",
      modifiers: [{ name: "offset", options: { offset: [0, 4] } }],
    },
  );

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<string[]>([]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    const fuse = new Fuse(data);
    const results = fuse.search(searchQuery, { limit: 5 });
    setSearchResults(results.map((result) => result.item));
  }, [data, searchQuery]);

  return (
    <div className="relative flex items-center">
      <input
        ref={inputRef}
        className="bg-gray-100 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-600 font-semibold text-sm py-1 px-2 rounded-sm w-full"
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={handleSearch}
      />
      {searchQuery && (
        <button
          className="hover:bg-gray-300 active:bg-opacity-60 dark:hover:bg-gray-600 dark:active:bg-opacity-60 rounded-full w-4 h-4 absolute right-2 inset-y-0 my-auto"
          onClick={() => setSearchQuery("")}
        >
          <svg
            width="100%"
            height="100%"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}
      <div
        ref={popperRef}
        style={{ ...popperStyles.popper, zIndex: 50 }}
        {...popperAttributes.popper}
      >
        <div
          className={
            "bg-white dark:bg-black shadow-lg dark:shadow-none dark:border-gray-600 dark:border rounded-sm text-sm " +
            (searchQuery ? "" : "invisible")
          }
          style={{ width }}
        >
          {!searchQuery ? null : searchResults.length > 0 ? (
            searchResults.map((result) => (
              <button
                key={result}
                className="py-1 px-2 hover:bg-gray-200 active:bg-opacity-60 dark:hover:bg-gray-700 dark:active:bg-opacity-60 w-full text-left first-of-type:rounded-t last-of-type:rounded-b"
                onClick={() => {
                  onAdd?.(result);
                  setSearchQuery("");
                }}
              >
                {result}
              </button>
            ))
          ) : (
            <div className="py-1 px-2">No results found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DropdownSearch;
