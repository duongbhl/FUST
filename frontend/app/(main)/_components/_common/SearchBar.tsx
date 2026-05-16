import { Search } from "lucide-react";

export default function SearchBar() {
  return (
    <div className="flex h-12 w-[220px] items-center gap-3 rounded-full border border-gray-200 bg-[#F5F7FF] px-5 lg:w-[320px] xl:w-[420px]">
      <Search size={18} className="text-gray-500" />

      <input
        type="text"
        placeholder="Search experiences..."
        className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
      />
    </div>
  );
}