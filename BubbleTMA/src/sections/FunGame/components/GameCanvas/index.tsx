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

    bots.forEach((bot, botIndex) => {
      const dx = playerBubble.x - bot.x;
      const dy = playerBubble.y - bot.y;
      const distanceToPlayer = Math.sqrt(dx * dx + dy * dy);
    
      if (bot.size > playerBubble.size && distanceToPlayer < 500) {
        let moveX = (dx / distanceToPlayer) * bot.speed;
        let moveY = (dy / distanceToPlayer) * bot.speed;
    
        bots.forEach((otherBot, otherIndex) => {
          if (botIndex !== otherIndex) {
            const distanceToOtherBot = Math.sqrt(
              Math.pow(bot.x - otherBot.x, 2) + Math.pow(bot.y - otherBot.y, 2)
            );
    
            if (distanceToOtherBot < bot.size + otherBot.size + 10) {
              const avoidX = bot.x - otherBot.x;
              const avoidY = bot.y - otherBot.y;
              const avoidDistance = Math.sqrt(avoidX * avoidX + avoidY * avoidY);
    
              moveX += (avoidX / avoidDistance) * bot.speed * 0.5;
              moveY += (avoidY / avoidDistance) * bot.speed * 0.5;
            }
          }
        });
    
        moveX += (Math.random() - 0.5) * 0.2;
        moveY += (Math.random() - 0.5) * 0.2;
    
        bot.x += moveX;
        bot.y += moveY;
      } else {
        bot.moveRandom();
      }
    
      bot.x = Math.max(bot.size, Math.min(bot.x, mapWidth - bot.size));
      bot.y = Math.max(bot.size, Math.min(bot.y, mapHeight - bot.size));
    
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
