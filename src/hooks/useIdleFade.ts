import { useCallback, useEffect, useRef, useState } from 'react';

interface UseIdleFadeOptions {
  enabled: boolean;
  delaySeconds: number;
  idleOpacity: number;
  isPaused: boolean;
}

export function useIdleFade({
  enabled,
  delaySeconds,
  idleOpacity,
  isPaused,
}: UseIdleFadeOptions) {
  const [isIdle, setIsIdle] = useState(false);
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const wake = useCallback(() => {
    clearTimer();
    setIsIdle(false);
    if (!enabled || isPaused) return;
    const ms = Math.max(1500, Math.min(60000, Math.round(delaySeconds * 1000)));
    timerRef.current = window.setTimeout(() => {
      setIsIdle(true);
    }, ms);
  }, [clearTimer, delaySeconds, enabled, isPaused]);

  useEffect(() => {
    if (!enabled || isPaused) {
      clearTimer();
      setIsIdle(false);
      return;
    }
    wake();
    return clearTimer;
  }, [enabled, isPaused, delaySeconds, wake, clearTimer]);

  const effectiveOpacity =
    enabled && isIdle && !isPaused
      ? Math.max(0.15, Math.min(0.9, idleOpacity))
      : 1;

  return {
    isIdle: enabled && isIdle && !isPaused,
    effectiveOpacity,
    wake,
  };
}
