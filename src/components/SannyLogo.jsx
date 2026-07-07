export default function SannyLogo() {
  return (
    <div className="fixed top-4 left-4 z-50 flex items-center gap-2 select-none">
      <img src="/logo.png" alt="Sanny Logo" className="w-12 h-12 object-contain" />
      <span className="font-display font-black text-[#f07c24] text-[33px] tracking-widest drop-shadow-[0_2px_8px_rgba(240,124,36,0.3)]">
        SANNY
      </span>
    </div>
  );
}
