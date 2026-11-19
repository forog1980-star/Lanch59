import React from 'react';
import { Cpu, HardDrive, MemoryStick, MonitorCheck, PlugZap, Wifi, WifiOff } from 'lucide-react';
import { DesktopInfo } from '../types/desktop';
import { LauncherSettings, SystemMetrics } from '../types/launcher';
import { toDisplayDigits } from '../utils/formatters';

interface SystemStatusBarProps {
  metrics: SystemMetrics;
  settings: LauncherSettings;
  desktopInfo: DesktopInfo | null;
  onOpenBridgeModal: () => void;
}

export const SystemStatusBar: React.FC<SystemStatusBarProps> = ({
  metrics,
  settings,
  desktopInfo,
  onOpenBridgeModal,
}) => {
  const d = (val: string | number) => toDisplayDigits(val, settings.usePersianDigits);
  const bridge = metrics.bridgeStats;

  const cpuPrimary = bridge
    ? `${d(bridge.cpuUsagePercent)}٪ مصرف`
    : metrics.cpuCores !== null
      ? `${d(metrics.cpuCores)} هسته منطقی`
      : 'نامشخص';

  const cpuSub = bridge
    ? `${d(metrics.cpuCores ?? '')} هسته · ${bridge.cpuModel.slice(0, 26)}`
    : 'درصد لحظه‌ای نیازمند نسخه دسکتاپ یا پل ویندوز';

  const ramPrimary = bridge
    ? `${d(bridge.usedMemoryGb)} / ${d(bridge.totalMemoryGb)} GB`
    : metrics.deviceMemoryGb !== null
      ? `حدود ${d(metrics.deviceMemoryGb)} GB`
      : metrics.jsHeapUsedMb !== null
        ? `${d(metrics.jsHeapUsedMb)} MB (Heap)`
        : 'محدودیت مرورگر';

  const ramSub = bridge
    ? desktopInfo
      ? `حافظه کل سیستم · مصرف برنامه: ${d(desktopInfo.memoryRssMb)} MB`
      : 'حافظه واقعی ویندوز'
    : metrics.jsHeapUsedMb !== null
      ? `حافظه تب: ${d(metrics.jsHeapUsedMb)} از ${d(metrics.jsHeapLimitMb ?? 0)} MB`
      : 'گزارش تقریبی مرورگر';

  const storagePrimary =
    bridge && bridge.diskTotalGb > 0
      ? `${d(bridge.diskFreeGb)} GB آزاد`
      : metrics.storageQuotaMb !== null
        ? `${d(Math.round(metrics.storageQuotaMb))} MB فضای محلی`
        : 'محدودیت مرورگر';

  const storageSub =
    bridge && bridge.diskTotalGb > 0
      ? `درایو ${bridge.diskDrive} از ${d(bridge.diskTotalGb)} GB`
      : metrics.storageUsedMb !== null
        ? `مصرف وب: ${d(metrics.storageUsedMb)} MB (درایو C نیازمند نسخه دسکتاپ)`
        : 'فضای ذخیره‌سازی مرورگر';

  const netPrimary = metrics.online ? 'متصل به شبکه' : 'قطع ارتباط';
  const netSub = metrics.online
    ? metrics.downlinkMbps !== null
      ? `پهنای باند تقریبی: ${d(metrics.downlinkMbps)} Mbps`
      : 'وضعیت آنلاین سیستم'
    : 'عملکرد آفلاین و محلی فعال است';

  return (
    <section
      aria-label="وضعیت واقعی سیستم"
      className="w-full max-w-[1380px] mx-auto px-4 sm:px-8 mt-2"
    >
      <div className="acrylic-surface rounded-2xl px-4 sm:px-5 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 flex-1">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-9 h-9 rounded-xl bg-[#0078D4]/30 border border-[#65D5FF]/25 flex items-center justify-center shrink-0">
              <Cpu className="w-4 h-4 text-[#65D5FF]" strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-[#B9DDFF]/75">پردازنده (CPU)</div>
              <div className="text-sm font-medium text-[#F5FAFF] tabular-nums truncate">
                {cpuPrimary}
              </div>
              <div className="text-[11px] text-[#B9DDFF]/65 truncate">{cpuSub}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-9 h-9 rounded-xl bg-[#0078D4]/30 border border-[#65D5FF]/25 flex items-center justify-center shrink-0">
              <MemoryStick className="w-4 h-4 text-[#65D5FF]" strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-[#B9DDFF]/75">حافظه (RAM)</div>
              <div className="text-sm font-medium text-[#F5FAFF] tabular-nums truncate">
                {ramPrimary}
              </div>
              <div className="text-[11px] text-[#B9DDFF]/65 truncate">{ramSub}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-9 h-9 rounded-xl bg-[#0078D4]/30 border border-[#65D5FF]/25 flex items-center justify-center shrink-0">
              <HardDrive className="w-4 h-4 text-[#65D5FF]" strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-[#B9DDFF]/75">فضای ذخیره‌سازی</div>
              <div className="text-sm font-medium text-[#F5FAFF] tabular-nums truncate">
                {storagePrimary}
              </div>
              <div className="text-[11px] text-[#B9DDFF]/65 truncate">{storageSub}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-9 h-9 rounded-xl bg-[#0078D4]/30 border border-[#65D5FF]/25 flex items-center justify-center shrink-0">
              {metrics.online ? (
                <Wifi className="w-4 h-4 text-[#65D5FF]" strokeWidth={1.8} />
              ) : (
                <WifiOff className="w-4 h-4 text-amber-300" strokeWidth={1.8} />
              )}
            </div>
            <div className="min-w-0">
              <div className="text-xs text-[#B9DDFF]/75">شبکه و اینترنت</div>
              <div className="text-sm font-medium text-[#F5FAFF] truncate">{netPrimary}</div>
              <div className="text-[11px] text-[#B9DDFF]/65 truncate">{netSub}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between lg:justify-end gap-3 border-t lg:border-t-0 lg:border-r border-[#B9DDFF]/15 pt-3 lg:pt-0 lg:pr-4 shrink-0">
          {desktopInfo ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-emerald-500/15 border border-emerald-300/35 text-emerald-100 whitespace-nowrap">
              <MonitorCheck className="w-4 h-4 shrink-0" strokeWidth={1.8} />
              <span>
                نسخه بومی دسکتاپ · اجرا در {d(desktopInfo.startupMs)} ms
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenBridgeModal}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#65D5FF] ${
                metrics.bridgeConnected
                  ? 'bg-emerald-500/15 border-emerald-300/35 text-emerald-100 hover:bg-emerald-500/25'
                  : 'bg-white/8 border-[#B9DDFF]/25 text-[#E8F4FF] hover:bg-white/15'
              }`}
            >
              <PlugZap className="w-4 h-4 shrink-0" strokeWidth={1.8} />
              <span>
                {metrics.bridgeConnected
                  ? 'پل محلی ویندوز متصل'
                  : 'اتصال به پل محلی ویندوز'}
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
