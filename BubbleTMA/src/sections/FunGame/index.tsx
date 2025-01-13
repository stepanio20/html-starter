import { useTonAddress } from '@tonconnect/ui-react'
import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import Joystick from '../../features/Joystick'
import useGetDemoCoinApi from '../../shared/api/get-demoCoin'
import { useTelegram } from '../../shared/hooks/useTelegram'
import { RootState } from '../../store'
import MoveTimer from '../Game/components/ui/MoveTimer'
import { Bubble } from './classes/Bubble'
import { PlayerBubble } from './classes/PlayerBubble'
import GameCanvas from './components/GameCanvas'
import GameOver from './components/GameOver'
import GameTimer from './components/GameTimer'
import Minimap from './components/MiniMap'
import styles from './style.module.css'

const FunGame: React.FC = () => {
  const [gameTime, setGameTime] = useState(40);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [moveStatus, setMoveStatus] = useState(false);
  const location = useLocation();
  const navigate = useNavigate()
  const { amount } = location.state || {}
  const { telegramId } = useTelegram()
  const { userId } = useSelector((state: RootState) => state.user)
  const userFriendlyAddress = useTonAddress()
  const { updateDemoCoin, updateDemoCoinWithoutAuth, removeDemoCoinWithoutAuth, removeDemoCoin } = useGetDemoCoinApi()
  const [eaten, setEaten] = useState<boolean>(false)
  const mapWidth = 4000;
  const mapHeight = 4000;

  if (!amount) {
    navigate('/')
  }

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
  
  const joystickRef = useRef({ deltaX: 0, deltaY: 0 });
  const once = useRef<boolean>(false)

  const playerBubble = useRef(new PlayerBubble(mapWidth / 2, mapHeight / 2, Number(amount)));
  const bots = useRef<Bubble[]>([]);

  const initializeGame = () => {
    setGameRunning(true);
    setGameOver(false);
    bots.current = Array.from({ length: 20 }, () => {
      const value = Math.random() * 10 + 5;
      return new Bubble(Math.random() * mapWidth, Math.random() * mapHeight, value);
    });
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
          playerBubble.current.calculateSpeed();
          bots.current.splice(i, 1);
          updateUserCoin(bot.value);
        } else {
          setEaten(true);
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
            bot1.calculateSpeed();
            bots.current.splice(j, 1);
          } else {
            bot2.size += bot1.size * 0.2;
            bot2.value += bot1.value;
            bot2.calculateSpeed();
            bots.current.splice(i, 1);
          }
        }
      }
    }
  };
  
  useEffect(() => {
    if (eaten) {
      removeUserCoin();
    }
  }, [eaten])

  useEffect(() => {
    if (!once.current && amount) {
      initializeGame();
      once.current = true
    }
  }, [amount]);

  const handleJoystickMove = (deltaX: number, deltaY: number) => {
    joystickRef.current.deltaX = deltaX;
    joystickRef.current.deltaY = deltaY;
  };

  const handleTimerEnd = () => {
    setGameOver(true);
    setGameRunning(false);
  };

  return (
    <div>
      <div className={styles.canvasContainer}>
        {gameRunning && 
        <GameCanvas
          playerBubble={playerBubble.current}
          bots={bots.current}
          mapHeight={mapHeight}
          mapWidth={mapWidth}
          joystickRef={joystickRef}
          checkCollision={checkCollisions}
          setMoveStatus={setMoveStatus}
        />
        }
        {gameRunning && (
          <GameTimer
            initialTime={gameTime}
            onTimerEnd={handleTimerEnd}
            onTimeChange={(time) => setGameTime(time)}
          />
        )}
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
      {gameOver && <GameOver amount={amount} eaten={eaten} playerBalance={playerBubble.current.value}/>}
    </div>
  );
};

export default FunGame;