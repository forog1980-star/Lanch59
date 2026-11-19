import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Search, X } from 'lucide-react';
import { AppShortcut, LauncherSettings } from '../types/launcher';

interface CentralHaloProps {
  settings: LauncherSettings;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  topMatch: AppShortcut | null;
  onLaunchTopMatch: () => void;
}

interface Mote {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  alpha: number;
}

export const CentralHalo: React.FC<CentralHaloProps> = ({
  settings,
  searchQuery,
  onSearchChange,
  searchInputRef,
  topMatch,
  onLaunchTopMatch,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  const intensityScale =
    settings.haloIntensity === 'subtle'
      ? 0.65
      : settings.haloIntensity === 'radiant'
        ? 1.25
        : 1;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || settings.reduceMotion) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 540;
    const height = 360;
    canvas.width = width;
    canvas.height = height;

    const motes: Mote[] = Array.from({ length: 16 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 0.9 + Math.random() * 1.5,
      vx: (Math.random() - 0.5) * 0.14,
      vy: -0.05 - Math.random() * 0.12,
      alpha: 0.18 + Math.random() * 0.42,
    }));

    let rafId = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      for (const m of motes) {
        m.x += m.vx;
        m.y += m.vy;
        if (m.y < -10) {
          m.y = height + 10;
          m.x = Math.random() * width;
        }
        if (m.x < -10) m.x = width + 10;
        if (m.x > width + 10) m.x = -10;

        const dx = m.x - width / 2;
        const dy = m.y - height / 2;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const radialFade = Math.max(0, 1 - dist / 245);

        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(141, 219, 255, ${(m.alpha * radialFade * intensityScale).toFixed(3)})`;
        ctx.fill();
      }
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [settings.reduceMotion, intensityScale]);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (settings.reduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 9;
    setParallax({ x: nx, y: ny });
  };

  const handleMouseLeave = () => {
    setParallax({ x: 0, y: 0 });
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && topMatch && searchQuery.trim().length > 0) {
      e.preventDefault();
      onLaunchTopMatch();
    } else if (e.key === 'Escape' && searchQuery) {
      onSearchChange('');
    }
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[920px] mx-auto px-4 pt-5 pb-4 sm:pt-7 sm:pb-6 flex flex-col items-center text-center"
    >
      <div className="relative flex flex-col items-center justify-center py-5 sm:py-7 select-none">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{
            transform: settings.reduceMotion
              ? undefined
              : `translate3d(${parallax.x * 0.6}px, ${parallax.y * 0.6}px, 0)`,
            transition: 'transform 350ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div
            className="w-[310px] h-[310px] sm:w-[410px] sm:h-[410px] rounded-full blur-3xl animate-halo-breathe"
            style={{
              background:
                'radial-gradient(circle, rgba(101, 213, 255, 0.34) 0%, rgba(56, 169, 255, 0.24) 38%, rgba(0, 120, 212, 0.09) 68%, transparent 100%)',
              opacity: Math.min(1, 0.76 * intensityScale),
            }}
          />
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{
            transform: settings.reduceMotion
              ? undefined
              : `translate3d(${parallax.x * 0.35}px, ${parallax.y * 0.35}px, 0)`,
            transition: 'transform 400ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <svg
            viewBox="0 0 380 380"
            className="w-[300px] h-[300px] sm:w-[376px] sm:h-[376px] overflow-visible"
          >
            <defs>
              <linearGradient id="haloRingGradA" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#65D5FF" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#8DABFF" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#38A9FF" stopOpacity="0.72" />
              </linearGradient>
              <linearGradient id="haloRingGradB" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F5FAFF" stopOpacity="0.65" />
                <stop offset="60%" stopColor="#0078D4" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#65D5FF" stopOpacity="0.6" />
              </linearGradient>
              <filter id="cyanEnergyGlow" x="-25%" y="-25%" width="150%" height="150%">
                <feGaussianBlur stdDeviation="4.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <circle
              cx="190"
              cy="190"
              r="148"
              fill="none"
              stroke="url(#haloRingGradA)"
              strokeWidth="2.4"
              filter="url(#cyanEnergyGlow)"
              opacity={0.78 * Math.min(1.15, intensityScale)}
              className="origin-center animate-halo-spin-slow"
              style={{ transformOrigin: '190px 190px' }}
            />

            <circle
              cx="190"
              cy="190"
              r="168"
              fill="none"
              stroke="url(#haloRingGradA)"
              strokeWidth="1"
              strokeDasharray="170 42 54 34"
              className="origin-center animate-halo-spin-slow"
              style={{ transformOrigin: '190px 190px' }}
            />

            <circle
              cx="190"
              cy="190"
              r="134"
              fill="none"
              stroke="url(#haloRingGradB)"
              strokeWidth="1.4"
              strokeDasharray="220 30 80 26"
              className="origin-center animate-halo-spin-reverse"
              style={{ transformOrigin: '190px 190px' }}
            />

            <circle
              cx="190"
              cy="190"
              r="112"
              fill="none"
              stroke="rgba(185, 221, 255, 0.28)"
              strokeWidth="1"
            />
          </svg>

          {!settings.reduceMotion && (
            <div className="absolute w-[240px] h-[240px] sm:w-[288px] sm:h-[288px] rounded-full border border-[#65D5FF]/32 animate-wave-ripple" />
          )}
        </div>

        {!settings.reduceMotion && (
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] sm:w-[540px] h-[290px] sm:h-[360px]"
          />
        )}

        <div
          className="relative z-10 flex flex-col items-center justify-center"
          style={{
            transform: settings.reduceMotion
              ? undefined
              : `translate3d(${-parallax.x * 0.25}px, ${-parallax.y * 0.25}px, 0)`,
            transition: 'transform 350ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <span
            dir="ltr"
            className="font-display text-xs sm:text-sm font-semibold tracking-[0.42em] text-[#B9DDFF] uppercase mb-0.5 pl-[0.42em]"
          >
            LAUNCHER
          </span>

          <div className="relative flex items-center justify-center" dir="ltr">
            <span
              aria-hidden="true"
              className="font-display font-extrabold text-[108px] sm:text-[138px] leading-[0.9] tracking-[-0.04em] text-[#0078D4]/30 blur-[2px] translate-y-1.5 select-none"
            >
              59
            </span>
            <h1 className="absolute inset-0 font-display font-extrabold text-[108px] sm:text-[138px] leading-[0.9] tracking-[-0.04em] number-59-glass select-none">
              59
            </h1>
          </div>

          <p className="mt-4 text-sm sm:text-base text-[#E2F1FF]/90 font-normal tracking-wide max-w-md">
            نقطه شروع هوشمند و شفاف دسکتاپ ویندوز
          </p>
        </div>
      </div>

      <div className="relative z-20 w-full max-w-[580px] mt-4 sm:mt-5">
        <div className="acrylic-surface rounded-2xl flex items-center gap-3 px-4 py-3 focus-within:border-[#65D5FF]/65 focus-within:shadow-[0_0_28px_-4px_rgba(56,169,255,0.4)] transition-all">
          <Search className="w-5 h-5 text-[#65D5FF] shrink-0" strokeWidth={1.8} />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="جستجوی سریع نرم‌افزار، ابزار یا پروتکل (Ctrl + K)..."
            className="w-full bg-transparent text-sm sm:text-[15px] text-[#F5FAFF] placeholder:text-[#B9DDFF]/55 focus:outline-none"
            aria-label="جستجوی سریع نرم‌افزارها"
          />
          {searchQuery ? (
            <div className="flex items-center gap-2 shrink-0">
              {topMatch && (
                <button
                  type="button"
                  onClick={onLaunchTopMatch}
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0078D4]/60 hover:bg-[#0078D4]/85 text-xs text-[#F5FAFF] transition-colors whitespace-nowrap"
                >
                  <span>اجرای {topMatch.englishName}</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="p-1 rounded-lg text-[#B9DDFF]/75 hover:text-[#F5FAFF] hover:bg-white/10 transition-colors"
                aria-label="پاک کردن جستجو"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <kbd
              dir="ltr"
              className="hidden sm:inline-flex items-center px-2 py-0.5 text-[11px] font-mono-tabular text-[#B9DDFF]/70 bg-white/5 border border-[#B9DDFF]/20 rounded-md shrink-0"
            >
              Ctrl + K
            </kbd>
          )}
        </div>
      </div>
    </section>
  );
};
