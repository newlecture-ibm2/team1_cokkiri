export function BrandLoading() {
  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center gap-8"
      aria-busy
      aria-label="불러오는 중"
    >
      {/* Brand Mark */}
      <div className="flex flex-col items-center gap-5 animate-fade-in">
        <h2 className="text-[clamp(1.5rem,3vw,2.5rem)] font-black tracking-tighter text-primary/80 uppercase">
          Co<span className="text-accent">Kkiri</span>
        </h2>
      </div>

      {/* Dot Pulse Indicator */}
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-accent/60 animate-dot-pulse [animation-delay:0ms]" />
        <span className="h-2 w-2 rounded-full bg-accent/60 animate-dot-pulse [animation-delay:150ms]" />
        <span className="h-2 w-2 rounded-full bg-accent/60 animate-dot-pulse [animation-delay:300ms]" />
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dot-pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50%      { opacity: 1;   transform: scale(1.2); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out both;
        }
        .animate-dot-pulse {
          animation: dot-pulse 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
