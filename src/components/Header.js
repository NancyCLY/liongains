export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full h-12 bg-blue-100 border-b z-40 flex items-center px-4">
      <span className="font-semibold text-blue-800 hidden sm:block">
        LionGains
      </span>
      <span className="font-semibold text-blue-800 sm:hidden">LG</span>
    </header>
  );
}
