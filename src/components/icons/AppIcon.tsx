import React from 'react';
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

interface AppIconProps {
  iconKey: IconKey;
  className?: string;
}

export const AppIcon: React.FC<AppIconProps> = ({ iconKey, className = 'w-6 h-6' }) => {
  const props = { className, strokeWidth: 1.75 };

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
