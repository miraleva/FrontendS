export default function SannyLogo({ className, imgClassName, textClassName }) {
  return (
    <div className={className || "fixed top-4 left-4 z-50 flex items-center gap-2 select-none"}>
      <img src="/logo.png" alt="Sanny Logo" className={imgClassName || "w-12 h-12 object-contain"} />
      <span className={textClassName || "font-display font-black text-[#f07c24] text-[33px] tracking-widest drop-shadow-[0_2px_8px_rgba(240,124,36,0.3)]"}>
        SANNY
      </span>
    </div>
  );
}
