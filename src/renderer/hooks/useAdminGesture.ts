import { useEffect, useRef } from 'react';

interface AdminGestureOptions {
  target?: Element | null;
  minDistance?: number;
  holdTime?: number;
  onGestureComplete?: () => void;
}

export const useAdminGesture = ({
  target = document.body,
  minDistance = 50,
  holdTime = 5000,
  onGestureComplete
}: AdminGestureOptions = {}) => {
  const gestureTimerRef = useRef<NodeJS.Timeout | null>(null);
  const gestureInProgressRef = useRef(false);
  const startPointsRef = useRef<number[] | null>(null);
  const interactionActiveRef = useRef(false);
  const mouseStartXRef = useRef<number | null>(null);

  useEffect(() => {
    if (!target) return;

    const startGesture = () => {
      if (!interactionActiveRef.current) return;
      
      gestureInProgressRef.current = true;
      gestureTimerRef.current = setTimeout(() => {
        if (gestureInProgressRef.current && interactionActiveRef.current) {
          onGestureComplete?.();
          resetGesture();
        }
      }, holdTime);
    };

    const cancelGesture = (reason?: string) => {
      if (gestureInProgressRef.current) {
        console.log('Gesto cancelado:', reason);
        resetGesture();
      }
    };

    const resetGesture = () => {
      if (gestureTimerRef.current) {
        clearTimeout(gestureTimerRef.current);
        gestureTimerRef.current = null;
      }
      gestureInProgressRef.current = false;
      startPointsRef.current = null;
      interactionActiveRef.current = false;
      mouseStartXRef.current = null;
    };

    const startInteraction = () => {
      interactionActiveRef.current = true;
    };

    const stopInteraction = () => {
      if (gestureInProgressRef.current) {
        cancelGesture("interacción terminada antes de tiempo");
      }
      interactionActiveRef.current = false;
    };

    // --- Eventos táctiles ---
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2 && interactionActiveRef.current) {
        startPointsRef.current = [e.touches[0].clientX, e.touches[1].clientX];
        startGesture();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!gestureInProgressRef.current || !interactionActiveRef.current || 
          e.touches.length !== 2 || !startPointsRef.current) return;
      
      const movedRight =
        e.touches[0].clientX > startPointsRef.current[0] + minDistance &&
        e.touches[1].clientX > startPointsRef.current[1] + minDistance;
      
      if (!movedRight) {
        cancelGesture("no se desplazó lo suficiente");
      }
    };

    // --- Eventos de mouse (para debug) ---
    const handleMouseDown = (e: MouseEvent) => {
      if (interactionActiveRef.current) {
        mouseStartXRef.current = e.clientX;
        startGesture();
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!gestureInProgressRef.current || !interactionActiveRef.current || 
          mouseStartXRef.current === null) return;
      
      const deltaX = e.clientX - mouseStartXRef.current;
      if (deltaX < 0) {
        cancelGesture("mouse se movió hacia la izquierda");
      }
    };

    const handleMouseLeave = () => {
      if (gestureInProgressRef.current) {
        cancelGesture("mouse salió del elemento");
      }
    };

    // Eventos de interacción general
    const handleInteractionStart = (e: Event) => {
      if (e.type === 'mousedown' || e.type === 'touchstart') {
        startInteraction();
      }
    };

    const handleInteractionEnd = (e: Event) => {
      if (e.type === 'mouseup' || e.type === 'touchend' || e.type === 'touchcancel') {
        stopInteraction();
      }
    };

    // Agregar event listeners
    const events = {
      // Interacción general
      mousedown: handleInteractionStart,
      touchstart: handleInteractionStart,
      mouseup: handleInteractionEnd,
      touchend: handleInteractionEnd,
      touchcancel: handleInteractionEnd,
      
      // Gestos específicos
      mousemove: handleMouseMove,
      mouseleave: handleMouseLeave,
      touchmove: handleTouchMove
    };

    // Eventos especiales que necesitan ser manejados por separado
    target.addEventListener('mousedown', handleMouseDown);
    target.addEventListener('touchstart', handleTouchStart);

    // Agregar todos los eventos
    Object.entries(events).forEach(([event, handler]) => {
      target.addEventListener(event, handler as EventListener);
    });

    // Cleanup
    return () => {
      resetGesture();
      
      target.removeEventListener('mousedown', handleMouseDown);
      target.removeEventListener('touchstart', handleTouchStart);
      
      Object.entries(events).forEach(([event, handler]) => {
        target.removeEventListener(event, handler as EventListener);
      });
    };
  }, [target, minDistance, holdTime, onGestureComplete]);

  // Función para cancelar manualmente el gesto
  const cancelGesture = () => {
    if (gestureTimerRef.current) {
      clearTimeout(gestureTimerRef.current);
      gestureTimerRef.current = null;
    }
    gestureInProgressRef.current = false;
    startPointsRef.current = null;
    interactionActiveRef.current = false;
    mouseStartXRef.current = null;
  };

  return { cancelGesture };
};