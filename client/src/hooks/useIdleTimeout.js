import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const useIdleTimeout = (timeoutMs = 30 * 60 * 1000) => {
  const { logout } = useAuth();
  const timerRef = useRef(null);
  const warningTimerRef = useRef(null);

  const resetTimer = useCallback(() => {
    // Clear existing timers
    if (timerRef.current) clearTimeout(timerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);

    // Set warning timer (5 minutes before timeout)
    const warningMs = Math.max(0, timeoutMs - 5 * 60 * 1000);
    warningTimerRef.current = setTimeout(() => {
      toast('Heads up: Your session will expire in 5 minutes due to inactivity.', {
        icon: '⚠️',
        duration: 8000
      });
    }, warningMs);

    // Set actual logout timer
    timerRef.current = setTimeout(() => {
      toast('Session expired due to inactivity', {
        icon: '⏱',
        duration: 5000
      });
      logout();
    }, timeoutMs);
  }, [logout, timeoutMs]);

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    // Throttle the event listeners a bit to avoid too many re-renders/timers if desired... 
    // Here we just attach directly as the resetTimer uses clearTimeout which is fast.
    events.forEach(e => document.addEventListener(e, resetTimer, true));
    
    // Initialize timer
    resetTimer();

    return () => {
      // Cleanup
      if (timerRef.current) clearTimeout(timerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      events.forEach(e => document.removeEventListener(e, resetTimer, true));
    };
  }, [resetTimer]);
};

export default useIdleTimeout;
