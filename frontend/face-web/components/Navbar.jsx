export default function Navbar() {
  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="text-2xl font-bold text-indigo-700 flex items-center gap-2">
          🔐 Face File Manager
        </div>
        <div className="text-sm text-gray-500 hidden sm:block">
          Secure. Private. Effortless.
        </div>
      </nav>
    </header>
  );
}
