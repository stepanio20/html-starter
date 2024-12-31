import React, { useEffect, useRef, useState } from 'react'
import Joystick from '../../features/Joystick'
import styles from './style.module.css'

const App: React.FC = () => {
  const [playerBalance, setPlayerBalance] = useState(10);
  const [gameTime, setGameTime] = useState(40);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const timerRef = useRef<number | null>(null);

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

    draw(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number) {
      ctx.beginPath();
      ctx.arc(this.x - offsetX, this.y - offsetY, this.size, 0, Math.PI * 2);
      ctx.fillStyle = 'blue';
      ctx.fill();
      ctx.closePath();

      ctx.fillStyle = "#000";
      ctx.font = `14px Arial`;
      ctx.textAlign = "center";
      ctx.fillText(`$${this.value.toFixed(2)}`, this.x - offsetX, this.y - offsetY + 5);
    }
  }

  const playerBubble = useRef(new PlayerBubble(mapWidth / 2, mapHeight / 2, playerBalance));

  const bubbles = useRef<Bubble[]>([]);
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

    constructor(x: number, y: number, value: number, color: string) {
      this.value = value;
      this.size = Math.sqrt(value) * 15;
      this.x = x;
      this.y = y;
      this.color = color;
      this.dx = Math.random() * 2 - 1;
      this.dy = Math.random() * 2 - 1;
      this.speed = Math.max(0.2, 3 / Math.sqrt(this.size));
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

    draw(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number) {
      ctx.beginPath();
      ctx.arc(this.x - offsetX, this.y - offsetY, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.closePath();

      ctx.fillStyle = "#000";
      ctx.font = `14px Arial`;
      ctx.textAlign = "center";
      ctx.fillText(`$${this.value.toFixed(2)}`, this.x - offsetX, this.y - offsetY + 5);
    }
  }

  const initializeGame = () => {
    playerBubble.current.size = Math.sqrt(playerBalance) * 15;
    playerBubble.current.value = playerBalance;

    setGameTime(40);
    setGameRunning(true);
    setGameOver(false);

    bubbles.current = [];
    bots.current = [];
    for (let i = 0; i < 50; i++) {
      const value = Math.random() * 5 + 1;
      const x = Math.random() * mapWidth;
      const y = Math.random() * mapHeight;
      bubbles.current.push(new Bubble(x, y, value, "lightgreen"));
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
    for (let i = bubbles.current.length - 1; i >= 0; i--) {
      const bubble = bubbles.current[i];
      const dx = playerBubble.current.x - bubble.x;
      const dy = playerBubble.current.y - bubble.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < playerBubble.current.size + bubble.size) {
        playerBubble.current.size += bubble.size * 0.1;
        playerBubble.current.value += bubble.value;
        bubbles.current.splice(i, 1);
      }
    }

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
          setGameRunning(false)
          return;
        }
      }
    }
  };

  const animate = () => {
    if (!gameRunning) return;
  
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    const offsetX = playerBubble.current.x - canvas.width / 2;
    const offsetY = playerBubble.current.y - canvas.height / 2;
  
    console.log('playerBubble position:', playerBubble.current.x, playerBubble.current.y);
  
    playerBubble.current.x += joystickRef.current.deltaX * playerBubble.current.speed * 5;
    playerBubble.current.y += joystickRef.current.deltaY * playerBubble.current.speed * 5;
  
    playerBubble.current.x = Math.max(playerBubble.current.size, Math.min(playerBubble.current.x, mapWidth - playerBubble.current.size));
    playerBubble.current.y = Math.max(playerBubble.current.size, Math.min(playerBubble.current.y, mapHeight - playerBubble.current.size));
  
    playerBubble.current.draw(ctx, offsetX, offsetY);
  
    bubbles.current.forEach((bubble) => {
      bubble.moveRandom();
      bubble.draw(ctx, offsetX, offsetY);
    });
  
    bots.current.forEach((bot) => {
      bot.moveRandom();
      bot.draw(ctx, offsetX, offsetY);
    });
  
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
      {gameRunning ? (
        <div className={styles.canvasContainer}>
        <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        style={{ backgroundColor: '#f0f0f0',  display: "block" }}/>
        <Joystick onMove={handleJoystickMove} />
        </div>
      ) : (
        <div id="menu" style={{ textAlign: 'center', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
        <h1>Bubble Game</h1>
        <div>Balance: ${playerBalance.toFixed(2)}</div>
        {!gameRunning && !gameOver && (
          <button onClick={initializeGame} className={styles?.buttonStyle}>Play</button>
        )}
        {gameOver && (
          <button onClick={() => initializeGame()} className={styles?.buttonStyle}>Restart Game</button>
        )}
        </div>
      )}
    </div>
  );
};

export default App;