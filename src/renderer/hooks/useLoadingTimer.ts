// hooks/useLoadingTimer.ts
import { useRef, useState, useEffect } from 'react';

interface UseLoadingTimerProps {
  duration?: number; // ms
  onFinish?: () => void;
}

export const useLoadingTimer = ({ duration = 7000, onFinish }: UseLoadingTimerProps) => {
  const [imageOpacity, setImageOpacity] = useState(0);
  const [blinking, setBlinking] = useState(false);
  const [waitingForPin, setWaitingForPin] = useState(false);

  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fadeOutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const remainingTimeRef = useRef<number>(duration);
  const pausedRef = useRef<boolean>(false);
  const forcedStartRef = useRef<boolean>(false);

  useEffect(() => {
    const fadeInTimer = setTimeout(() => {
      setImageOpacity(1);
      startLoadingTimer();
    }, 500);

    return () => {
      clearTimeout(fadeInTimer);
      clearAllTimers();
    };
  }, []);

  const clearAllTimers = () => {
    if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (fadeOutTimerRef.current) clearTimeout(fadeOutTimerRef.current);
  };

  const startLoadingTimer = (forceStart = false) => {
    if (!forceStart && (pausedRef.current || waitingForPin)) return;
    forcedStartRef.current = forceStart;
    startTimeRef.current = Date.now();
    loadingTimerRef.current = setTimeout(() => {
      if (forcedStartRef.current || (!waitingForPin && !pausedRef.current)) {
        finishLoading();
      }
      forcedStartRef.current = false;
    }, remainingTimeRef.current);
  };

  const pauseLoadingTimer = () => {
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
      const elapsed = Date.now() - startTimeRef.current;
      remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
      pausedRef.current = true;
    }
  };

  const resumeLoadingTimer = () => {
    if (pausedRef.current && remainingTimeRef.current > 0 && !waitingForPin) {
      pausedRef.current = false;
      startLoadingTimer();
    } else if (remainingTimeRef.current <= 0) finishLoading();
  };

  const finishLoading = () => {
    setImageOpacity(0);
    fadeOutTimerRef.current = setTimeout(() => {
      if (onFinish) onFinish();
    }, 500);
  };

  const handlePressStart = () => {
    holdTimerRef.current = setTimeout(() => {
      pauseLoadingTimer();
      setBlinking(true);
      setTimeout(() => setWaitingForPin(true), 1600);
    }, 3000);
  };

  const handlePressEnd = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const handleCancelPin = () => {
    setWaitingForPin(false);
    setBlinking(false);
    pausedRef.current = false;
    startLoadingTimer(true);
  };

  return {
    imageOpacity,
    blinking,
    waitingForPin,
    handlePressStart,
    handlePressEnd,
    pauseLoadingTimer,
    resumeLoadingTimer,
    finishLoading,
    handleCancelPin,
  };
};
