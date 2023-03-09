const Chip: React.FC<
  React.HTMLProps<HTMLDivElement> & {
    label: string;
    onDelete?: () => void;
  }
> = ({ label, onDelete, className, ...props }) => {
  return (
    <div
      {...props}
      className={
        "flex justify-center items-center py-1 px-2 rounded-full text-xs bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 " +
        className
      }
    >
      <div>{label}</div>
      {onDelete && (
        <button
          className="hover:bg-gray-400 active:bg-opacity-60 dark:hover:bg-gray-500 dark:active:bg-opacity-60 rounded-full w-4 h-4 ml-0.5"
          onClick={onDelete}
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
    </div>
  );
};

export default Chip;
