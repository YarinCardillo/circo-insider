import { useState, useEffect, useRef } from 'react';

export function useTimer(initialSeconds, onEnd) {
  const [remaining, setRemaining] = useState(initialSeconds);
  const intervalRef = useRef(null);

  useEffect(() => {
    setRemaining(initialSeconds);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          onEnd?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [initialSeconds, onEnd]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  const isUrgent = remaining <= 30;

  return {
    remaining,
    isUrgent,
    formattedTime
  };
}
