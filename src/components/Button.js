export function Button({ children, onClick }) {
    return (
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={onClick}
      >
        {children}
      </button>
    );
  }
  