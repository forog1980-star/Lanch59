import { BridgeSystemStats, SystemMetrics } from '../types/launcher';

interface NavigatorExtended extends Navigator {
  deviceMemory?: number;
  connection?: {
    effectiveType?: string;
    downlink?: number;
  };
}

interface PerformanceExtended extends Performance {
  memory?: {
    usedJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

export async function fetchBridgeStats(bridgeUrl: string): Promise<BridgeSystemStats | null> {
  if (typeof window !== 'undefined' && window.launcher59Desktop) {
    try {
      return await window.launcher59Desktop.getSystemStats();
    } catch {
      return null;
    }
  }

  const cleanBase = bridgeUrl.replace(/\/+$/, '');
  if (!cleanBase.startsWith('http://127.0.0.1') && !cleanBase.startsWith('http://localhost')) {
    return null;
  }
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 900);
  try {
    const res = await fetch(`${cleanBase}/stats`, { signal: controller.signal });
    if (!res.ok) return null;
    const data = (await res.json()) as BridgeSystemStats;
    return data;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}

export async function collectRealSystemMetrics(bridgeUrl: string): Promise<SystemMetrics> {
  const nav = navigator as NavigatorExtended;
  const perf = performance as PerformanceExtended;

  let storageUsedMb: number | null = null;
  let storageQuotaMb: number | null = null;
  if (navigator.storage && typeof navigator.storage.estimate === 'function') {
    try {
      const estimate = await navigator.storage.estimate();
      if (typeof estimate.usage === 'number') {
        storageUsedMb = Math.round((estimate.usage / (1024 * 1024)) * 10) / 10;
      }
      if (typeof estimate.quota === 'number') {
        storageQuotaMb = Math.round((estimate.quota / (1024 * 1024)) * 10) / 10;
      }
    } catch {
      // Storage API restricted
    }
  }

  const bridgeStats = await fetchBridgeStats(bridgeUrl);

  return {
    online: navigator.onLine,
    connectionType: nav.connection?.effectiveType ?? null,
    downlinkMbps: typeof nav.connection?.downlink === 'number' ? nav.connection.downlink : null,
    cpuCores: typeof navigator.hardwareConcurrency === 'number' ? navigator.hardwareConcurrency : null,
    deviceMemoryGb: typeof nav.deviceMemory === 'number' ? nav.deviceMemory : null,
    jsHeapUsedMb: perf.memory ? Math.round(perf.memory.usedJSHeapSize / (1024 * 1024)) : null,
    jsHeapLimitMb: perf.memory ? Math.round(perf.memory.jsHeapSizeLimit / (1024 * 1024)) : null,
    storageUsedMb,
    storageQuotaMb,
    bridgeConnected: bridgeStats !== null,
    bridgeStats,
    lastUpdated: Date.now(),
  };
}
