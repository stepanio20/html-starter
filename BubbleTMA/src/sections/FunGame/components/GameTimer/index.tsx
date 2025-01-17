import React, { useEffect, useRef, useState } from 'react'

interface GameTimerProps {
  initialTime: number;
  onTimerEnd: () => void;
  onTimeChange?: (time: number) => void;
}

const GameTimer: React.FC<GameTimerProps> = ({ initialTime, onTimerEnd, onTimeChange }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setTimeLeft(initialTime);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        const updatedTime = prev - 1;

        if (onTimeChange) onTimeChange(updatedTime);

        if (updatedTime <= 0) {
          clearInterval(timerRef.current!);
          onTimerEnd();
        }

        return updatedTime;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [initialTime, onTimerEnd, onTimeChange]);

  return (
    <p style={{ position: 'absolute', top: '230px', right: '20px' }}>
      Game Over: {timeLeft}s
    </p>
  );
};

export default GameTimer;
