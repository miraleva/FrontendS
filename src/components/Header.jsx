export default function Header() {
  return (
    <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-6">
      <span className="text-sm font-medium text-text-secondary">Operasyon Asistani</span>
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-accent" />
        <span className="text-xs text-text-secondary">Servisler aktif</span>
      </div>
    </header>
  );
}
