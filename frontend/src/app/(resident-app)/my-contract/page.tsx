export default function MyContractPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-[clamp(2rem,5vw,5rem)]">
        <div className="flex flex-col gap-[clamp(0.75rem,1.5vw,1.5rem)]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-[clamp(1rem,2vw,2rem)] border-b border-primary/10 pb-[clamp(1rem,2vw,2rem)]">
            <div className="min-w-0 space-y-4">
              <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight uppercase whitespace-nowrap text-primary">
                CONTRACT<span className="underline underline-offset-4 decoration-[var(--color-accent)]">S.</span>
                <span className="text-2xl md:text-4xl font-bold tracking-normal ml-2 align-bottom opacity-80">내 계약</span>
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="py-24 text-center border-2 border-dashed border-primary/10 rounded-[clamp(1rem,2vw,2rem)] bg-primary/2">
        <p className="text-lg font-bold tracking-tight text-primary">활성화된 계약 정보가 없습니다</p>
        <p className="mt-2 text-sm font-black uppercase tracking-[0.2em] text-primary/80">
          No active contracts found.
        </p>
      </div>
    </div>
  );
}
