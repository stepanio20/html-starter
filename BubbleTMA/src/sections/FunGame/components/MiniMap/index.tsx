import React, { useEffect, useRef } from 'react'
import styles from './styles.module.css'
interface MinimapProps {
  playerBubble: { x: number; y: number; size: number; color: string; value: number };
  bots: { x: number; y: number; size: number; color: string; value: number }[];
  mapWidth: number;
  mapHeight: number;
}

const Minimap: React.FC<MinimapProps> = ({
  playerBubble,
  bots,
  mapWidth,
  mapHeight,
}) => {
  const minimapRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const drawMinimap = () => {
      const minimapCanvas = minimapRef.current!;
      const ctx = minimapCanvas.getContext('2d')!;
      ctx.clearRect(0, 0, minimapCanvas.width, minimapCanvas.height);

      const minimapScale = minimapCanvas.width / mapWidth;

      ctx.beginPath();
      ctx.arc(
        playerBubble.x * minimapScale,
        playerBubble.y * minimapScale,
        Math.max(2, playerBubble.size * minimapScale),
        0,
        Math.PI * 2
      );
      ctx.fillStyle = playerBubble.color;
      ctx.fill();
      ctx.closePath();

      bots.forEach((bot) => {
        ctx.beginPath();
        ctx.arc(
          bot.x * minimapScale,
          bot.y * minimapScale,
          Math.max(2, bot.size * minimapScale),
          0,
          Math.PI * 2
        );
        ctx.fillStyle = bot.color;
        ctx.fill();
        ctx.closePath();
      });
    };

    drawMinimap();
  }, [playerBubble,  bots, mapWidth, mapHeight]);

  return (
    <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
      <canvas
        ref={minimapRef}
        width={200}
        height={200}
        className={styles.minimap}
      />
    </div>
  );
};

export default Minimap;
