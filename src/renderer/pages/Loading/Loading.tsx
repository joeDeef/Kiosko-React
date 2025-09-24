import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {AdminPinModal} from "../../components";
import "./Loading.css";

const Loading: React.FC = () => {
  const navigate = useNavigate();

  const [waitingForPin, setWaitingForPin] = useState(false);
  const [blinking, setBlinking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fadeOutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const remainingTimeRef = useRef<number>(7000); // 7 segundos
  const pausedRef = useRef<boolean>(false);

  useEffect(() => {
    // Inicia directamente el timer
    startLoadingTimer();
    return () => clearAllTimers();
  }, []);

  const clearAllTimers = () => {
    if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (fadeOutTimerRef.current) clearTimeout(fadeOutTimerRef.current);
  };

  // Timer de 7s
  const startLoadingTimer = () => {
    if (pausedRef.current || waitingForPin) return;
    startTimeRef.current = Date.now();

    loadingTimerRef.current = setTimeout(() => {
      if (!waitingForPin && !pausedRef.current) finishLoading();
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
    if (pausedRef.current && remainingTimeRef.current > 0) {
      pausedRef.current = false;
      startLoadingTimer();
    }
  };

  // Fade-out + navegación a home
  const finishLoading = () => {
    const img = document.getElementById("loading-img");
    if (img) img.classList.add("img-hidden");

    fadeOutTimerRef.current = setTimeout(() => {
      navigate("/home");
    }, 500);
  };

  // Long press mínimo 3s
  const handlePressStart = () => {
    holdTimerRef.current = setTimeout(() => {
      const img = document.getElementById("loading-img");
      if (img) img.classList.add("img-blink");

      pauseLoadingTimer();
      setBlinking(true);
      setWaitingForPin(true);
    }, 3000);
  };

  const handlePressEnd = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  // Confirmación de PIN
  const handleConfirmPin = (pin: string) => {
    if (pin === "1234") {
      setMessage("✅ Acceso concedido");
      setError(false);
      setTimeout(() => navigate("/admin"), 500);
    } else {
      setMessage("❌ PIN incorrecto");
      setError(true);
    }
  };

  // Cancelar PIN → reanuda timer
  const handleCancelPin = () => {
    setWaitingForPin(false);
    setBlinking(false);
    resumeLoadingTimer();

    const img = document.getElementById("loading-img");
    if (img) img.classList.remove("img-blink");
  };

  return (
    <div
      className="loading-screen"
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
    >
      <img
        id="loading-img"
        src="app-assets://img/smartSystemLogo_negativo.png"
        alt="Cargando..."
      />

      {waitingForPin && (
        <AdminPinModal
          onConfirm={handleConfirmPin}
          onCancel={handleCancelPin}
          message={message}
          error={error}
        />
      )}
    </div>
  );
};

export default Loading;
