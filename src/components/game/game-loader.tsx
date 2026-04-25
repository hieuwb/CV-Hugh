// Loader hiển thị trong lúc bundle Three.js + R3F tải xuống.
// Không import React hooks để giữ client payload cực nhỏ.
export function GameLoader() {
  return (
    <div className="fixed inset-0 grid place-items-center bg-[#07070d] text-white">
      <div className="flex flex-col items-center gap-5">
        <div className="relative w-14 h-14">
          <span className="absolute inset-0 rounded-full border-2 border-white/10" />
          <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#f4c26b] animate-spin" />
        </div>
        <div className="text-center">
          <p className="m-0 text-sm font-semibold tracking-wide">Đang tải thế giới 3D…</p>
          <p className="m-0 mt-1 text-xs text-white/50">
            Nếu lâu quá, <a href="/cv" className="text-[#f4c26b] underline">qua bản CV tĩnh</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
