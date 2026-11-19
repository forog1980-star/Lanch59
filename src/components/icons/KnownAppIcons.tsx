import React from 'react';

interface BrandIconProps {
  brandKey: string;
  className?: string;
}

/**
 * Crisp vector icons for widely-used Windows applications (Word, Excel, Chrome, Edge,
 * PowerShell, File Explorer, Notepad, Calculator, Paint, VS Code, Terminal, etc.).
 * Acts as an immediate high-clarity icon when real EXE extraction is unavailable (e.g. Web preview
 * or URI-only shortcuts), without restricting users to any fixed app list.
 */
export const KnownBrandIcon: React.FC<BrandIconProps> = ({
  brandKey,
  className = 'w-6 h-6',
}) => {
  switch (brandKey) {
    case 'word':
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
          <rect x="7" y="4" width="20" height="24" rx="3" fill="#2B7CD3" />
          <path d="M12 10h11M12 14h11M12 18h11M12 22h8" stroke="#CBE6FF" strokeWidth="1.6" strokeLinecap="round" />
          <rect x="3" y="8" width="15" height="16" rx="2.5" fill="#185ABD" />
          <path d="M6.4 12.2l1.6 7.6 2.5-6.2 2.5 6.2 1.6-7.6" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'excel':
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
          <rect x="7" y="4" width="20" height="24" rx="3" fill="#21A366" />
          <path d="M13 4v24M20 4v24M7 11h20M7 17h20M7 23h20" stroke="#A7F3D0" strokeWidth="1.1" strokeOpacity="0.65" />
          <rect x="3" y="8" width="15" height="16" rx="2.5" fill="#107C41" />
          <path d="M7.5 12.3l6 7.4M13.5 12.3l-6 7.4" stroke="#FFFFFF" strokeWidth="2.1" strokeLinecap="round" />
        </svg>
      );

    case 'powerpoint':
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
          <circle cx="17.5" cy="16" r="10.5" fill="#ED6C47" />
          <path d="M17.5 5.5A10.5 10.5 0 0 1 28 16H17.5V5.5Z" fill="#FF8F6B" />
          <rect x="3" y="8.5" width="15" height="15" rx="2.5" fill="#C43E1C" />
          <path d="M8 20v-8h3.2a2.4 2.4 0 0 1 0 4.8H8" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'chrome':
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
          <circle cx="16" cy="16" r="12" fill="#FBBC05" />
          <path d="M16 4a12 12 0 0 1 10.4 6H16a6 6 0 0 0-5.2 3L5.6 9.9A12 12 0 0 1 16 4Z" fill="#EA4335" />
          <path d="M5.6 9.9L10.8 13a6 6 0 0 0 5.2 9l-5.2 9A12 12 0 0 1 5.6 9.9Z" fill="#34A853" />
          <circle cx="16" cy="16" r="5.6" fill="#FFFFFF" />
          <circle cx="16" cy="16" r="4.1" fill="#1A73E8" />
        </svg>
      );

    case 'edge':
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
          <circle cx="16" cy="16" r="11.5" fill="#0078D4" />
          <path d="M6.5 13.5C8 8 13.5 5 19 6c4.5.8 7.8 4.4 8 8.7-1.6-2-4.6-2.8-7.4-2.1-3 .7-5 3.4-4.6 6.2.3 2 1.8 3.6 4 4.1-4.8 1.5-10.5-.7-12.5-5.3a11 11 0 0 1 0-4.1Z" fill="#35C1F1" />
          <path d="M15 26.8c5.5.4 10-2.8 11.4-7.4-2.2 1.8-5.4 2.5-8.4 1.5-2.6-.9-4.2-3-4-5.4-2.6 1.8-3.6 5.6-1.7 8.9.7 1.1 1.6 2 2.7 2.4Z" fill="#42E8B0" />
        </svg>
      );

    case 'firefox':
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
          <circle cx="16" cy="16" r="11.5" fill="#5B21B6" />
          <path d="M24 9c1.8 2.4 2.5 5.4 1.7 8.5-1.2 4.8-5.7 8-10.6 7.5-4.8-.5-8.6-4.5-8.8-9.3-.1-3.3 1.4-6.4 4-8.3-.7 2.5-.1 5.1 1.7 6.8 2 1.9 5.3 2 7.5.2 2-1.6 2.5-4.3 1.2-6.5 1.3.2 2.4.6 3.3 1.1Z" fill="#FF7139" />
          <circle cx="16.5" cy="16.5" r="4.5" fill="#FBBF24" fillOpacity="0.88" />
        </svg>
      );

    case 'powershell':
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
          <path d="M7 6.5h19.5a2 2 0 0 1 1.9 2.6l-3.4 14.5a2 2 0 0 1-1.9 1.5H3.6a2 2 0 0 1-1.9-2.6L5.1 8A2 2 0 0 1 7 6.5Z" fill="#012456" stroke="#5391FE" strokeWidth="1.5" />
          <path d="M9.5 12l5 4-5 4" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16.5 20h5.2" stroke="#65D5FF" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );

    case 'explorer':
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
          <path d="M4 9.5A2.5 2.5 0 0 1 6.5 7h5.6l2.4 2.4h11A2.5 2.5 0 0 1 28 12v11.5A2.5 2.5 0 0 1 25.5 26h-19A2.5 2.5 0 0 1 4 23.5v-14Z" fill="#F5B932" />
          <path d="M4 12.5h24v11A2.5 2.5 0 0 1 25.5 26h-19A2.5 2.5 0 0 1 4 23.5v-11Z" fill="#FFD666" />
          <rect x="11.5" y="19.5" width="9" height="4.5" rx="1.2" fill="#0078D4" />
        </svg>
      );

    case 'notepad':
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
          <rect x="6" y="5" width="20" height="23" rx="3" fill="#E6F4FF" />
          <rect x="6" y="5" width="20" height="5.5" rx="2" fill="#0EA5E9" />
          <path d="M10.5 3.5v3.5M16 3.5v3.5M21.5 3.5v3.5" stroke="#0369A1" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M10 15h12M10 19h12M10 23h8" stroke="#0284C7" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );

    case 'calculator':
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
          <rect x="6" y="4" width="20" height="24" rx="3.5" fill="#1E293B" stroke="#60A5FA" strokeWidth="1.3" />
          <rect x="9" y="7" width="14" height="5.5" rx="1.4" fill="#38BDF8" fillOpacity="0.28" />
          <circle cx="11" cy="16.5" r="1.4" fill="#E2E8F0" />
          <circle cx="16" cy="16.5" r="1.4" fill="#E2E8F0" />
          <circle cx="11" cy="21.5" r="1.4" fill="#E2E8F0" />
          <circle cx="16" cy="21.5" r="1.4" fill="#E2E8F0" />
          <rect x="19.5" y="15" width="3.5" height="8" rx="1.4" fill="#38A9FF" />
        </svg>
      );

    case 'paint':
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
          <path d="M16 5C9.4 5 4.5 9.8 4.5 16c0 5.6 4.4 10.5 10.2 10.5 2.1 0 3.5-1.1 3.5-2.6 0-1-.5-1.7-1.1-2.3-.5-.5-.8-1-.8-1.6 0-1.1.9-2 2-2h2.4c3.9 0 6.8-2.8 6.8-6.4C27.5 7.9 22.3 5 16 5Z" fill="#E0F2FE" />
          <circle cx="10.5" cy="13.5" r="2" fill="#EF4444" />
          <circle cx="14.8" cy="10" r="2" fill="#F59E0B" />
          <circle cx="20.2" cy="10.8" r="2" fill="#10B981" />
          <circle cx="22.5" cy="15.2" r="2" fill="#3B82F6" />
        </svg>
      );

    case 'vscode':
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
          <path d="M22.8 4.5L11.2 15.2 6.8 11.8 4.5 13v6l2.3 1.2 4.4-3.4 11.6 10.7L27.5 25V7l-4.7-2.5Z" fill="#007ACC" />
          <path d="M22.8 4.5L27.5 7v18l-4.7 2.5V4.5Z" fill="#38A9FF" />
          <path d="M22.8 10.4L14.8 16l8 5.6V10.4Z" fill="#0A2540" />
        </svg>
      );

    case 'terminal':
    case 'cmd':
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
          <rect x="4" y="6" width="24" height="20" rx="3.2" fill="#111827" stroke="#64748B" strokeWidth="1.4" />
          <path d="M9.5 12.5l4.2 3.5-4.2 3.5" stroke="#38BDF8" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 19.5h6.5" stroke="#E2E8F0" strokeWidth="2.1" strokeLinecap="round" />
        </svg>
      );

    case 'outlook':
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
          <rect x="8" y="6" width="19" height="20" rx="2.5" fill="#28A8EA" />
          <path d="M8 10l9.5 6.5L27 10" stroke="#E0F2FE" strokeWidth="1.6" />
          <rect x="3" y="9" width="14" height="14" rx="2.5" fill="#0078D4" />
          <circle cx="10" cy="16" r="3.6" stroke="#FFFFFF" strokeWidth="2" />
        </svg>
      );

    case 'win-settings':
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
          <circle cx="16" cy="16" r="9.5" stroke="#65D5FF" strokeWidth="3.2" strokeDasharray="4.2 3.2" />
          <circle cx="16" cy="16" r="4.5" fill="#0078D4" stroke="#E0F2FE" strokeWidth="1.8" />
        </svg>
      );

    case 'photoshop':
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
          <rect x="4" y="4" width="24" height="24" rx="5" fill="#001E36" stroke="#31A8FF" strokeWidth="1.6" />
          <text x="16" y="20.5" textAnchor="middle" fill="#31A8FF" fontSize="13" fontWeight="700" fontFamily="Outfit, sans-serif">
            Ps
          </text>
        </svg>
      );

    case 'telegram':
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
          <circle cx="16" cy="16" r="12" fill="#29A9EB" />
          <path d="M22.2 10.6L9.8 15.4c-.8.3-.8 1.4 0 1.7l3.1 1 1.2 3.6c.2.6 1 .8 1.5.3l1.8-1.8 3.2 2.3c.6.4 1.5.1 1.6-.6l1.7-9.8c.2-.9-.7-1.6-1.7-1.5Z" fill="#FFFFFF" />
        </svg>
      );

    default:
      return null;
  }
};
