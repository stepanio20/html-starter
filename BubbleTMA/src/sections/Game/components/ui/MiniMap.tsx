import React, { useEffect, useRef } from 'react'
import { Player } from '../../../../slices/GameSlide'
import styles from './styles.module.css'

interface MinimapProps {
  players: Player[];
  playerBubble: { x: number; y: number; size: number; color: string };
  mapWidth: number;
  mapHeight: number;
  PlayerId: string | null;
}

const Minimap: React.FC<MinimapProps> = ({ players, playerBubble, mapWidth, mapHeight, PlayerId }) => {
  const minimapRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const drawMinimap = () => {
      const minimapCanvas = minimapRef.current!;
      const ctx = minimapCanvas.getContext('2d')!;
      ctx.clearRect(0, 0, minimapCanvas.width, minimapCanvas.height);

      const minimapScale = minimapCanvas.width / mapWidth;

      players.forEach((player) => {
        const isCurrentPlayer = player.id === PlayerId;
        ctx.beginPath();
        ctx.arc(
          player.x * minimapScale,
          player.y * minimapScale,
          Math.max(2, player.size * minimapScale),
          0,
          Math.PI * 2
        );
        ctx.fillStyle = isCurrentPlayer ? player.color : '#ccc';
        ctx.fill();
        ctx.closePath();
      });

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
    };

    drawMinimap();
  }, [players, playerBubble, mapWidth, mapHeight, PlayerId]);

  return (
    <canvas
      ref={minimapRef}
      width={200}
      height={200}
      className={styles.minimap}
    />
  );
};

export default Minimap;
