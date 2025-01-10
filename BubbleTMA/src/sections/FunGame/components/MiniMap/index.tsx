import React, { useEffect, useRef } from "react"
import styles from "./styles.module.css"

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

  const drawMinimap = () => {
    const minimapCanvas = minimapRef.current;
    if (!minimapCanvas) return;

    const ctx = minimapCanvas.getContext("2d");
    if (!ctx) return;

    const minimapScale = minimapCanvas.width / mapWidth;

    // Очищаем холст
    ctx.clearRect(0, 0, minimapCanvas.width, minimapCanvas.height);

    // Рисуем текущего игрока
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

    // Рисуем ботов
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

  useEffect(() => {
    const updateMinimap = () => {
      drawMinimap();
      requestAnimationFrame(updateMinimap); // Обеспечиваем плавное обновление
    };

    updateMinimap();

    // Убираем animation frame при размонтировании
    return () => {
      cancelAnimationFrame(updateMinimap as unknown as number);
    };
  }, [playerBubble, bots, mapWidth, mapHeight]);

  return (
    <div style={{ position: "absolute", top: "10px", right: "10px" }}>
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
