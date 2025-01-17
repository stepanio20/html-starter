import React, { useEffect, useRef } from 'react'
import { drawMapBorders } from '../../../../shared/utils/DrawMapBorders'
import { Bubble } from '../../classes/Bubble'
import { PlayerBubble } from '../../classes/PlayerBubble'
import { drawGrid } from '../DrawGrid'

interface GameCanvasProps {
  playerBubble: PlayerBubble;
  bots: Bubble[];
  joystickRef: React.MutableRefObject<{ deltaX: number; deltaY: number }>;
  mapWidth: number;
  mapHeight: number;
	checkCollision: () => void;
	setMoveStatus: React.Dispatch<React.SetStateAction<boolean>>
}

const GameCanvas: React.FC<GameCanvasProps> = ({ playerBubble, bots, joystickRef, mapWidth, mapHeight, checkCollision, setMoveStatus }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  let lastMoveTime = Date.now();
  let isInactive = false;

  const animate = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    playerBubble.x += joystickRef.current.deltaX * playerBubble.speed * 5;
    playerBubble.y += joystickRef.current.deltaY * playerBubble.speed * 5;

    playerBubble.x = Math.max(playerBubble.size, Math.min(playerBubble.x, mapWidth - playerBubble.size));
    playerBubble.y = Math.max(playerBubble.size, Math.min(playerBubble.y, mapHeight - playerBubble.size));

    const scale = 1.9;
    const offsetX = playerBubble.x - canvas.width / 2;
    const offsetY = playerBubble.y - canvas.height / 2;

    drawGrid(ctx, canvas.width, canvas.height, 100 / scale, offsetX, offsetY, scale);
    drawMapBorders(ctx, mapWidth, mapHeight, offsetX, offsetY, canvas.width, canvas.height);

    const currentTime = Date.now();
    if (joystickRef.current.deltaX !== 0 || joystickRef.current.deltaY !== 0) {
      lastMoveTime = currentTime;
      if (isInactive) {
        setMoveStatus(false);
        isInactive = false;
      }
    } else if (currentTime - lastMoveTime > 10000 && !isInactive) {
      setMoveStatus(true);
      isInactive = true;
    }

    bots.forEach((bot) => {
      bot.moveRandom();
      bot.draw(ctx, offsetX, offsetY);
    });

    playerBubble.draw(ctx, offsetX, offsetY);
		checkCollision()
    requestAnimationFrame(animate);
  };

  useEffect(() => {
    animate();
  }, []);



  return (
    <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} />
  );
};

export default GameCanvas;
