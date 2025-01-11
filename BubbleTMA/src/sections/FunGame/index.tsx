import { useTonAddress } from '@tonconnect/ui-react'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import Joystick from '../../features/Joystick'
import useGetDemoCoinApi from '../../shared/api/get-demoCoin'
import { useTelegram } from '../../shared/hooks/useTelegram'
import { drawMapBorders } from '../../shared/utils/DrawMapBorders'
import { RootState } from '../../store'
import MoveTimer from '../Game/components/ui/MoveTimer'
import { drawGrid } from './components/DrawGrid'
import GameOver from './components/GameOver'
import Minimap from './components/MiniMap'
import styles from './style.module.css'

const FunGame: React.FC = () => {
  const [gameTime, setGameTime] = useState(40);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [moveStatus, setMoveStatus] = useState(false);
  const mapWidth = 4000;
  const mapHeight = 4000;
  const location = useLocation();
  const navigate = useNavigate()
  const { amount } = location.state || {}
  const { telegramId } = useTelegram()
  const { userId } = useSelector((state: RootState) => state.user)
  const userFriendlyAddress = useTonAddress()
  const { updateDemoCoin, updateDemoCoinWithoutAuth, removeDemoCoinWithoutAuth, removeDemoCoin } = useGetDemoCoinApi()
  const dispatch = useDispatch()

  const updateUserCoin = (amount: number | string) => {
    let uuId = localStorage.getItem('userId')
    if (telegramId || userFriendlyAddress) {
      updateDemoCoin(userId, amount)
    } else if (uuId) {
      updateDemoCoinWithoutAuth(uuId, amount)
    }
  }

  const removeUserCoin = () => {
    let uuId = localStorage.getItem('userId')
    if (telegramId || userFriendlyAddress) {
      removeDemoCoin(userId, playerBubble.current?.value)
    } else if (uuId) {
      removeDemoCoinWithoutAuth(uuId, playerBubble.current?.value)
    }
  }

  if (!amount) {
    navigate('/')
  }

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const joystickRef = useRef({ deltaX: 0, deltaY: 0 });
  const once = useRef<boolean>(false)

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
      this.size = (this.value >= 100 && window.innerHeight < 431) ? Math.sqrt(value) * 6 : Math.sqrt(value) * 15;
      this.speed = 0.2;
    }
  
    draw(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number) {
      ctx.beginPath();
      ctx.arc(this.x - offsetX, this.y - offsetY, this.size, 0, Math.PI * 2);
      ctx.fillStyle = 'blue';
      ctx.fill();
  
      const borderThickness = this.size * 0.06;
      ctx.beginPath();
      ctx.arc(this.x - offsetX, this.y - offsetY, this.size - borderThickness, 0, Math.PI * 2);
      ctx.lineWidth = borderThickness;
      ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
      ctx.stroke();
      ctx.closePath();
  
      ctx.fillStyle = '#000';
      ctx.font = `${Math.max(14, this.size * 0.3)}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(`$${this.value.toFixed(2)}`, this.x - offsetX, this.y - offsetY);
    }
  }
  

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

    draw(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number) {
      ctx.beginPath();
      ctx.arc(this.x - offsetX, this.y - offsetY, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();

      const borderThickness = this.size * 0.06;
      ctx.beginPath();
      ctx.arc(this.x - offsetX, this.y - offsetY, this.size - borderThickness, 0, Math.PI * 2);
      ctx.lineWidth = borderThickness;
      ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
      ctx.stroke();
      ctx.closePath();

      ctx.fillStyle = '#000';
      ctx.font = `${Math.max(14, this.size * 0.3)}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(`$${this.value.toFixed(2)}`, this.x - offsetX, this.y - offsetY);
    }
  }

  const playerBubble = useRef(new PlayerBubble(mapWidth / 2, mapHeight / 2, Number(amount)));
  const bots = useRef<Bubble[]>([]);

  const initializeGame = () => {
    setGameRunning(true);
    setGameOver(false);
    bots.current = Array.from({ length: 20 }, () => {
      const value = Math.random() * 10 + 5;
      return new Bubble(Math.random() * mapWidth, Math.random() * mapHeight, value);
    });
    startTimer();
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setGameTime((prev) => {
        if (prev === 0) {
          clearInterval(timerRef.current!);
          setGameOver(true);
          setGameRunning(false);
        }
        return prev - 1;
      });
    }, 1000);
  };

  const checkCollisions = () => {
    for (let i = bots.current.length - 1; i >= 0; i--) {
      const bot = bots.current[i];
      const dx = playerBubble.current?.x - bot.x;
      const dy = playerBubble.current?.y - bot.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < (playerBubble.current?.size ?? 0) + bot.size) {
        if (playerBubble.current?.size! > bot.size) {
          playerBubble.current.size += bot.size * 0.2;
          playerBubble.current.value += bot.value;
          bots.current.splice(i, 1);
          updateUserCoin(bot.value);
        } else {
          setGameOver(true);
          setGameRunning(false);
          return;
        }
      }
    }

    for (let i = bots.current.length - 1; i >= 0; i--) {
      const bot1 = bots.current[i];
    
      if (!bot1) continue;
    
      for (let j = i - 1; j >= 0; j--) {
        const bot2 = bots.current[j];
    
        if (!bot2) continue;
    
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
  
  useEffect(() => {
    if (gameOver) {
      removeUserCoin();
    }
  }, [gameOver])

  let lastMoveTime = Date.now();
  let isInactive = false;


  const animate = () => {
    if (!gameRunning) return;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    playerBubble.current.x += joystickRef.current.deltaX * playerBubble.current.speed * 5;
    playerBubble.current.y += joystickRef.current.deltaY * playerBubble.current.speed * 5;

    playerBubble.current.x = Math.max(
        playerBubble.current.size,
        Math.min(playerBubble.current.x, mapWidth - playerBubble.current.size)
    );
    playerBubble.current.y = Math.max(
        playerBubble.current.size,
        Math.min(playerBubble.current.y, mapHeight - playerBubble.current.size)
    );

    const scale = 1.9

    const offsetX = playerBubble.current.x - canvas.width / 2;
    const offsetY = playerBubble.current.y - canvas.height / 2;

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

      bots.current.forEach((bot) => {
        bot.moveRandom();
        bot.draw(ctx, offsetX, offsetY);
      });

    playerBubble.current.draw(ctx, offsetX, offsetY);


    checkCollisions();

    requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (!once.current && amount) {
      initializeGame();
      once.current = true
    }
  }, [amount]);

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
          style={{ backgroundColor: '#f0f0f0', display: 'block' }}
        />
        <p style={{ position: 'absolute', top: '230px', right: '10px' }}>Game Over: {gameTime}</p>

        <Minimap 
          playerBubble={{
            x: playerBubble.current.x,
            y: playerBubble.current.y,
            size: playerBubble.current?.size ?? 0,
            color: 'blue',
            value: playerBubble.current?.value ?? 0
          }}
          bots={bots.current}
          mapWidth={mapWidth}
          mapHeight={mapHeight}
        />

        <Joystick onMove={handleJoystickMove} />
      </div>

      {moveStatus && !gameOver && (
        <MoveTimer setGameOver={setGameOver} />
      )}

      {gameOver && <GameOver />}
    </div>
  );
};

export default FunGame;
