import React, { useRef, useState } from "react"
import styles from "./style.module.css"

interface JoystickProps {
  onMove: (deltaX: number, deltaY: number) => void;
}

const Joystick: React.FC<JoystickProps> = ({ onMove }) => {
  const [active, setActive] = useState(false);
  const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 });
  const [handlePosition, setHandlePosition] = useState({ x: 0, y: 0 });
  const handleRef = useRef<HTMLDivElement | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setActive(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setJoystickPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setHandlePosition({
      x: 0,
      y: 0,
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!active) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const dx = e.clientX - rect.left - joystickPosition.x;
    const dy = e.clientY - rect.top - joystickPosition.y;

    const distance = Math.min(50, Math.sqrt(dx ** 2 + dy ** 2));
    const angle = Math.atan2(dy, dx);

    const newX = Math.cos(angle) * distance;
    const newY = Math.sin(angle) * distance;

    setHandlePosition({ x: newX, y: newY });

    const deltaX = newX / 50;
    const deltaY = newY / 50;

    onMove(deltaX, deltaY);
  };

  const handlePointerUp = () => {
    setActive(false);
    setHandlePosition({ x: 0, y: 0 });

    onMove(0, 0);
  };

  return (
    <div
      className={styles.gameCanvas}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {active && (
        <div
          className={styles.joystick}
          style={{
            left: `${joystickPosition.x - 50}px`,
            top: `${joystickPosition.y - 50}px`,
          }}
        >
          <div
            className={styles.joystickHandle}
            ref={handleRef}
            style={{
              transform: `translate(${handlePosition.x}px, ${handlePosition.y}px)`,
            }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default Joystick;
