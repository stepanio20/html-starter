import React, { useEffect, useRef, useState } from 'react'
import Joystick from '../../features/Joystick'
import { drawMapBorders } from '../../shared/utils/DrawMapBorders'
import GameOver from '../Game/components/ui/GameOver'
import MoveTimer from '../Game/components/ui/MoveTimer'
import { drawGrid } from './components/DrawGrid'
import Minimap from './components/MiniMap'
import styles from './style.module.css'

const FunGame: React.FC = () => {
  const [playerBalance, setPlayerBalance] = useState(10);
  const [gameTime, setGameTime] = useState(40);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const [moveStatus, setMoveStatus] = useState<boolean>(false)

	useEffect(() => {
	  initializeGame()
	},[])

  const joystickRef = useRef({ deltaX: 0, deltaY: 0 });

  const mapWidth = 4000;
  const mapHeight = 4000;

  class PlayerBubble {
    x: number;
    y: number;
    size: number;
    value: number;
    speed: number;

    constructor(x: number, y: number, value: number) {
      this.x = x;
      this.y = y;
      this.value = value;
      this.size = Math.sqrt(value) * 15;
      this.speed = 0.2;
    }

		draw(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number, color: string) {
			ctx.beginPath();
			ctx.arc(this.x - offsetX, this.y - offsetY, this.size, 0, Math.PI * 2);
			ctx.fillStyle = color;
			ctx.fill();
			ctx.closePath();

			const borderThickness = this.size * 0.06;
			ctx.beginPath();
			ctx.arc(this.x - offsetX, this.y - offsetY, this.size - borderThickness, 0, Math.PI * 2);
			ctx.lineWidth = borderThickness;
			ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
			ctx.stroke();
			ctx.closePath();

			const fontSize = Math.max(14, this.size * 0.3);
			ctx.fillStyle = "#000";
			ctx.font = `${fontSize}px Arial`;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText(`$${this.value.toFixed(2)}`, this.x - offsetX, this.y - offsetY);
		}
  }

  const playerBubble = useRef(new PlayerBubble(mapWidth / 2, mapHeight / 2, playerBalance));

  const bots = useRef<Bubble[]>([]);

  class Bubble {
    value: number;
    size: number;
    x: number;
    y: number;
    color: string;
    dx: number;
    dy: number;
    speed: number;
  
    constructor(x: number, y: number, value: number, color?: string) {
      this.value = value;
      this.size = Math.sqrt(value) * 15;
      this.x = x;
      this.y = y;
      this.color = color || this.getRandomColor();
      this.dx = Math.random() * 2 - 1;
      this.dy = Math.random() * 2 - 1;
      this.speed = Math.max(0.2, 3 / Math.sqrt(this.size));
    }
  
    private getRandomColor() {
      const colors = ['#00C100', '#0098E0', '#ED1B24', '#EADD00', '#6B00EB', '#FF7F00', '#B6E51D'];
      return colors[Math.floor(Math.random() * colors.length)];
    }
  
    moveRandom() {
      this.x += this.dx * this.speed;
      this.y += this.dy * this.speed;
  
      if (this.x - this.size < 0 || this.x + this.size > mapWidth) {
        this.dx *= -1;
      }
      if (this.y - this.size < 0 || this.y + this.size > mapHeight) {
        this.dy *= -1;
      }
    }
  
    draw(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number, color?: string) {
      ctx.beginPath();
      ctx.arc(this.x - offsetX, this.y - offsetY, this.size, 0, Math.PI * 2);
      ctx.fillStyle = color || this.color;
      ctx.fill();
      ctx.closePath();
  
      const borderThickness = this.size * 0.06;
      ctx.beginPath();
      ctx.arc(this.x - offsetX, this.y - offsetY, this.size - borderThickness, 0, Math.PI * 2);
      ctx.lineWidth = borderThickness;
      ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
      ctx.stroke();
      ctx.closePath();
  
      const fontSize = Math.max(14, this.size * 0.3);
      ctx.fillStyle = "#000";
      ctx.font = `${fontSize}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`$${this.value.toFixed(2)}`, this.x - offsetX, this.y - offsetY);
    }
  }

  const initializeGame = () => {
    playerBubble.current.size = Math.sqrt(playerBalance) * 15;
    playerBubble.current.value = playerBalance;

    setGameTime(40);
    setGameRunning(true);
    setGameOver(false);

    bots.current = [];
    for (let i = 0; i < 10; i++) {
      const value = Math.random() * 10 + 5;
      const x = Math.random() * mapWidth;
      const y = Math.random() * mapHeight;
      bots.current.push(new Bubble(x, y, value));
    }
    
    for (let i = 0; i < 10; i++) {
      const value = Math.random() * 10 + 5;
      const x = Math.random() * mapWidth;
      const y = Math.random() * mapHeight;
      bots.current.push(new Bubble(x, y, value, `hsl(${Math.random() * 360}, 70%, 50%)`));
    }

    startTimer();
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      if (gameOver || !gameRunning) {
        clearInterval(timerRef.current!);
        return;
      }

      setGameTime((prevTime) => {
        if (prevTime <= 1) {
          endGame();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const endGame = () => {
    setGameRunning(false);
    setGameOver(true);
  };

  const checkCollisions = () => {
    for (let i = bots.current.length - 1; i >= 0; i--) {
      const bot = bots.current[i];
      const dx = playerBubble.current.x - bot.x;
      const dy = playerBubble.current.y - bot.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
  
      if (distance < playerBubble.current.size + bot.size) {
        if (playerBubble.current.size > bot.size) {
          playerBubble.current.size += bot.size * 0.2;
          playerBubble.current.value += bot.value;
          bots.current.splice(i, 1);
        } else {
          setGameOver(true);
          setGameRunning(false);
          return;
        }
      }
    }
  
    for (let i = bots.current.length - 1; i >= 0; i--) {
      for (let j = i - 1; j >= 0; j--) {
        const bot1 = bots.current[i];
        const bot2 = bots.current[j];
        const dx = bot1.x - bot2.x;
        const dy = bot1.y - bot2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
  
        if (distance < bot1.size + bot2.size) {
          if (bot1.size > bot2.size) {
            bot1.size += bot2.size * 0.2;
            bot1.value += bot2.value;
            bots.current.splice(j, 1);
          } else {
            bot2.size += bot1.size * 0.2;
            bot2.value += bot1.value;
            bots.current.splice(i, 1);
          }
        }
      }
    }
  };
  
  let lastMoveTime = Date.now();
  let isInactive = false;

  const animate = () => {
    if (!gameRunning) return;
  
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    const offsetX = playerBubble.current.x - canvas.width / 2;
    const offsetY = playerBubble.current.y - canvas.height / 2;
  
    const scale = (() => {
      if (window.innerWidth <= 375) return playerBubble.current.value < 1 ? 0.45 : 0.4;
      if (window.innerWidth <= 390) return playerBubble.current.value < 1 ? 0.45 : 0.5;
      if (window.innerWidth <= 430) return playerBubble.current.value < 1 ? 0.4 : 0.5;
      if (window.innerWidth <= 768) return playerBubble.current.value < 1 ? 0.6 : 1.3;
      return playerBubble.current.value < 0.5 ? 0.8 : 1.8;
    })();
  
    drawGrid(ctx, canvas.width, canvas.height, 100 / scale, offsetX, offsetY, scale);
  
    drawMapBorders(
      ctx,
      mapWidth,
      mapHeight,
      offsetX,
      offsetY,
      canvas.width,
      canvas.height
    );
  
    playerBubble.current.x += joystickRef.current.deltaX * playerBubble.current.speed * 5;
    playerBubble.current.y += joystickRef.current.deltaY * playerBubble.current.speed * 5;
  
    playerBubble.current.x = Math.max(playerBubble.current.size, Math.min(playerBubble.current.x, mapWidth - playerBubble.current.size));
    playerBubble.current.y = Math.max(playerBubble.current.size, Math.min(playerBubble.current.y, mapHeight - playerBubble.current.size));
  
    playerBubble.current.draw(ctx, offsetX, offsetY, 'blue');
  
    bots.current.forEach((bot) => {
      bot.moveRandom();
      bot.draw(ctx, offsetX, offsetY);
    });
  
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
  
    checkCollisions();
    requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (gameRunning) {
      animate();
    }
  }, [gameRunning]);

  const handleJoystickMove = (deltaX: number, deltaY: number) => {
    joystickRef.current.deltaX = deltaX;
    joystickRef.current.deltaY = deltaY;
  };

  return (
    <div>
        <div className={styles.canvasContainer}>
        <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        style={{ backgroundColor: '#f0f0f0',  display: "block" }}/>
        <p style={{position: 'absolute', top: '0', left: '50%'}}>{gameTime}</p>
        <Minimap
          playerBubble={{
            x: playerBubble.current.x,
            y: playerBubble.current.y,
            size: playerBubble.current.size,
            color: 'blue',
            value: playerBubble.current.value,
          }}
          bots={bots.current}
          mapWidth={mapWidth}
          mapHeight={mapHeight}
        />
        <Joystick onMove={handleJoystickMove} />
        </div>
        {moveStatus && !gameOver && (
          <MoveTimer setGameOver={setGameOver}/>
        )}
        {gameOver && (
            <GameOver/>
        )}
    </div>
  );
};

export default FunGame;