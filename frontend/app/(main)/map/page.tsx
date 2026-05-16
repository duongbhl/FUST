
import { Crosshair, Plus, Minus, ChevronRight } from "lucide-react";
import Header from "../_components/_common/Header";

export default function MapPage() {
  return (
    <main className="relative h-screen overflow-hidden bg-[#EEF1FA]">
      <Header />

      <div className="relative h-[calc(100vh-64px)] w-full">
        <div className="absolute inset-0 bg-[url('/images/map-bg.png')] bg-cover bg-center opacity-50" />

        <div className="absolute left-[28%] top-[40%] h-5 w-5 rounded-full bg-red-600" />
        <div className="absolute left-[52%] top-[60%] h-5 w-5 rounded-full bg-red-600" />
        <div className="absolute right-[22%] top-[28%] h-5 w-5 rounded-full bg-red-600" />

        <div className="absolute right-[24%] top-[48%] rounded-3xl bg-white p-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-orange-200" />

            <div>
              <h3 className="text-2xl font-semibold text-gray-900">
                An Nam Bistro
              </h3>

              <p className="text-gray-500">45 Phố Lý Thường Kiệt</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-10 flex w-[360px] items-center justify-between rounded-[28px] bg-white p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              🍴
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-gray-900">
                12 Điểm đến Chay
              </h3>

              <p className="text-gray-500">
                Đã được Blog review tại Hà Nội
              </p>
            </div>
          </div>

          <ChevronRight />
        </div>

        <div className="absolute bottom-10 right-10 flex flex-col gap-4">
          <button className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg">
            <Crosshair />
          </button>

          <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
            <button className="flex h-14 w-14 items-center justify-center border-b border-gray-200">
              <Plus />
            </button>

            <button className="flex h-14 w-14 items-center justify-center">
              <Minus />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}