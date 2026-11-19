import React, { useEffect, useState } from 'react';
import {
  Calculator,
  Code2,
  Compass,
  Cpu,
  FolderOpen,
  GitBranch,
  Globe,
  Layers,
  Mail,
  Music,
  PenTool,
  Settings,
  ShoppingBag,
  StickyNote,
  Terminal,
  Command,
} from 'lucide-react';
import { IconKey } from '../../types/launcher';
import { getUniqueMonogramPalette } from '../../utils/iconLibrary';
import { KnownBrandIcon } from './KnownAppIcons';

interface AppIconProps {
  iconKey: IconKey;
  className?: string;
  customIconDataUrl?: string;
  brandIconKey?: string;
  appName?: string;
  style?: React.CSSProperties;
}

export const AppIcon: React.FC<AppIconProps> = ({
  iconKey,
  className = 'w-6 h-6',
  customIconDataUrl,
  brandIconKey,
  appName,
  style,
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [customIconDataUrl]);

  // 1. Highest priority: real extracted EXE/LNK PNG or user-selected custom icon (preserves full transparency)
  if (customIconDataUrl && !imgFailed) {
    return (
      <img
        src={customIconDataUrl}
        alt={appName || 'آیکون برنامه'}
        referrerPolicy="no-referrer"
        draggable={false}
        onError={() => setImgFailed(true)}
        className={`${className} object-contain select-none pointer-events-none`}
        style={{
          ...style,
          filter: 'drop-shadow(0 2px 6px rgba(2, 12, 28, 0.45))',
        }}
      />
    );
  }

  // 2. Crisp recognized Windows application icon (Word, Excel, Chrome, PowerShell, Edge, Explorer, etc.)
  if (brandIconKey) {
    const brandRendered = <KnownBrandIcon brandKey={brandIconKey} className={className} />;
    if (brandRendered) {
      return (
        <span
          className="inline-flex items-center justify-center shrink-0"
          style={style}
        >
          {brandRendered}
        </span>
      );
    }
  }

  // 3. Unique monogram for custom unknown apps when iconKey is generic 'layers' and appName is provided
  if (iconKey === 'layers' && appName && appName.trim().length > 0) {
    const mono = getUniqueMonogramPalette(appName);
    return (
      <span
        className={`${className} inline-flex items-center justify-center rounded-lg font-display font-bold text-[11px] text-white select-none`}
        style={{
          ...style,
          background: mono.bg,
          border: `1px solid ${mono.border}`,
        }}
      >
        {mono.initials}
      </span>
    );
  }

  // 4. Built-in vector icon keys (backward-compatible)
  const props = { className, strokeWidth: 1.75, style };

  switch (iconKey) {
    case 'code':
      return <Code2 {...props} />;
    case 'terminal':
      return <Terminal {...props} />;
    case 'settings':
      return <Settings {...props} />;
    case 'browser':
      return <Compass {...props} />;
    case 'calculator':
      return <Calculator {...props} />;
    case 'store':
      return <ShoppingBag {...props} />;
    case 'figma':
      return <PenTool {...props} />;
    case 'music':
      return <Music {...props} />;
    case 'notes':
      return <StickyNote {...props} />;
    case 'mail':
      return <Mail {...props} />;
    case 'git':
      return <GitBranch {...props} />;
    case 'folder':
      return <FolderOpen {...props} />;
    case 'globe':
      return <Globe {...props} />;
    case 'cpu':
      return <Cpu {...props} />;
    case 'layers':
      return <Layers {...props} />;
    case 'command':
      return <Command {...props} />;
    default:
      return <Layers {...props} />;
  }
};
