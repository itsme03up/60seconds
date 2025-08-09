import { useEffect, useRef, useState } from "react";

export function useTimer(total = 60, playing = true) {
  const [sec, setSec] = useState(0);
  const startRef = useRef(0);
  const rafRef = useRef(0);
  const lastVisibilityRef = useRef(null);

  // visibilitychange対応 - タブ非アクティブからの復帰時にドリフト補正
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && lastVisibilityRef.current && playing) {
        // タブが非アクティブだった時間を考慮してstartRefを補正
        const now = performance.now();
        const drift = now - lastVisibilityRef.current;
        if (drift > 100) { // 100ms以上のドリフトがあった場合補正
          startRef.current += drift;
        }
      }
      lastVisibilityRef.current = performance.now();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [playing]);

  useEffect(() => {
    if (!playing) {
      cancelAnimationFrame(rafRef.current);
      return;
    }
    
    const base = performance.now() - sec * 1000;
    startRef.current = base;
    
    const loop = () => {
      const t = Math.min(total, (performance.now() - startRef.current) / 1000);
      setSec(t);
      if (t < total) {
        rafRef.current = requestAnimationFrame(loop);
      }
    };
    
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, total]);

  // 従来のAPIとの互換性を保つための追加プロパティ
  const timeElapsed = sec;
  const timeRemaining = total - sec;
  const progress = (sec / total) * 100;
  const isRunning = playing;
  const isCompleted = sec >= total;

  return {
    sec,
    timeElapsed,
    timeRemaining,
    progress,
    isRunning,
    isCompleted,
    setSec
  };
}
