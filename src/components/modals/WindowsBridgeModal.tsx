import React, { useState } from 'react';
import { Check, Copy, Download, PlugZap, RefreshCw, ShieldCheck, X } from 'lucide-react';
import { WINDOWS_BRIDGE_SCRIPT } from '../../data/defaultShortcuts';
import { LauncherSettings, SystemMetrics } from '../../types/launcher';

interface WindowsBridgeModalProps {
  open: boolean;
  settings: LauncherSettings;
  metrics: SystemMetrics;
  onClose: () => void;
  onUpdateBridgeUrl: (url: string) => void;
  onRetestConnection: () => Promise<void>;
}

export const WindowsBridgeModal: React.FC<WindowsBridgeModalProps> = ({
  open,
  settings,
  metrics,
  onClose,
  onUpdateBridgeUrl,
  onRetestConnection,
}) => {
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);

  if (!open) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(WINDOWS_BRIDGE_SCRIPT);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard fallback ignored
    }
  };

  const handleDownloadScript = () => {
    const blob = new Blob([WINDOWS_BRIDGE_SCRIPT], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'launcher59-bridge.mjs';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleTest = async () => {
    setTesting(true);
    await onRetestConnection();
    setTesting(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#041124]/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="پل ارتباطی ویندوز ۱۱"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl acrylic-modal rounded-2xl p-6 max-h-[88vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#B9DDFF]/15">
          <div className="flex items-center gap-2.5">
            <PlugZap className="w-5 h-5 text-[#65D5FF]" />
            <h2 className="text-base font-semibold text-[#F5FAFF]">
              پل محلی ویندوز ۱۱ (Windows Bridge)
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-[#B9DDFF] hover:text-[#F5FAFF] transition-colors"
            aria-label="بستن پنجره"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {/* Honest Technical Explanation */}
          <div className="p-4 rounded-xl bg-[#0078D4]/18 border border-[#65D5FF]/30 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#F5FAFF]">
              <ShieldCheck className="w-4 h-4 text-[#65D5FF]" />
              <span>محدودیت امنیتی مرورگر و راه‌حل استاندارد</span>
            </div>
            <p className="text-xs text-[#D9ECFF]/85 leading-relaxed">
              مرورگرهای وب به دلیل ایزوله‌سازی امنیتی (Sandbox)، اجازه اجرای مستقیم فایل‌های
              <span dir="ltr" className="mx-1 font-mono-tabular text-[#65D5FF]">.exe</span>
              یا خواندن درصد لحظه‌ای CPU، حافظه آزاد سیستم و فضای درایو
              <span dir="ltr" className="mx-1 font-mono-tabular text-[#65D5FF]">C:\</span>
              را ندارند. به همین دلیل، تمام اطلاعات پیش‌فرض در داشبورد فقط از APIهای واقعی مرورگر خوانده می‌شوند و هیچ عدد ساختگی تولید نمی‌شود.
            </p>
            <p className="text-xs text-[#D9ECFF]/85 leading-relaxed">
              برای فعال‌سازی اجرای بومی برنامه‌ها و دریافت آمار واقعی سخت‌افزار ویندوز، اسکریپت محلی زیر را روی کامپیوتر خود ذخیره و با Node.js اجرا کنید. این اسکریپت فقط روی
              <span dir="ltr" className="mx-1 font-mono-tabular text-[#65D5FF]">127.0.0.1:5959</span>
              گوش می‌دهد و هیچ داده‌ای به اینترنت ارسال نمی‌کند.
            </p>
          </div>

          {/* Connection Status & Endpoint */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-[#B9DDFF]/15">
            <div className="flex-1 min-w-0">
              <label className="block text-xs text-[#B9DDFF]/80 mb-1">نشانی پل محلی (Localhost)</label>
              <input
                dir="ltr"
                type="url"
                value={settings.bridgeUrl}
                onChange={(e) => onUpdateBridgeUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#051429]/70 border border-[#B9DDFF]/25 text-xs font-mono-tabular text-[#F5FAFF] focus:outline-none focus:border-[#65D5FF]"
              />
            </div>

            <div className="flex items-center gap-2 sm:pt-5 shrink-0">
              <button
                type="button"
                onClick={handleTest}
                disabled={testing}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-[#0078D4] hover:bg-[#198AE0] text-[#F5FAFF] transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                <span>بررسی اتصال</span>
              </button>
              <span
                className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border ${
                  metrics.bridgeConnected
                    ? 'bg-emerald-500/15 border-emerald-300/35 text-emerald-100'
                    : 'bg-white/5 border-[#B9DDFF]/20 text-[#B9DDFF]/80'
                }`}
              >
                {metrics.bridgeConnected ? 'متصل' : 'غیرفعال'}
              </span>
            </div>
          </div>

          {/* Connected Live Windows Summary */}
          {metrics.bridgeStats && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-300/25 text-xs text-emerald-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <div className="text-emerald-200/70">نام سیستم</div>
                <div dir="ltr" className="font-mono-tabular font-semibold mt-0.5 truncate">
                  {metrics.bridgeStats.hostname}
                </div>
              </div>
              <div>
                <div className="text-emerald-200/70">مدل پردازنده</div>
                <div dir="ltr" className="font-mono-tabular font-semibold mt-0.5 truncate">
                  {metrics.bridgeStats.cpuModel}
                </div>
              </div>
              <div>
                <div className="text-emerald-200/70">نسخه کرنل</div>
                <div dir="ltr" className="font-mono-tabular font-semibold mt-0.5">
                  {metrics.bridgeStats.osVersion}
                </div>
              </div>
              <div>
                <div className="text-emerald-200/70">زمان روشنایی</div>
                <div className="font-mono-tabular font-semibold mt-0.5">
                  {metrics.bridgeStats.uptimeHours} ساعت
                </div>
              </div>
            </div>
          )}

          {/* Script Actions & Code Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-[#B9DDFF]">
                اسکریپت محلی: <span dir="ltr" className="font-mono-tabular">launcher59-bridge.mjs</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-white/8 hover:bg-white/15 border border-[#B9DDFF]/20 text-[#F5FAFF] transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'کپی شد' : 'کپی کد'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadScript}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-[#0078D4] hover:bg-[#198AE0] text-[#F5FAFF] transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>دانلود اسکریپت</span>
                </button>
              </div>
            </div>

            <pre
              dir="ltr"
              className="p-3.5 rounded-xl bg-[#041022]/90 border border-[#B9DDFF]/18 text-[11px] font-mono-tabular text-[#B9DDFF]/90 overflow-x-auto max-h-56 leading-relaxed"
            >
              {WINDOWS_BRIDGE_SCRIPT}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
