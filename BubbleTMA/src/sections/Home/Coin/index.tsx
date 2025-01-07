import { useEffect, useState } from 'react'
import styles from './styles.module.scss'

interface CoinData {
  number: number;
  color: string;
  position: { top: number; left: number };
  size: { width: number; height: number };
  velocity: { dx: number; dy: number }; // Скорость движения
}

function generateRandomPosition(existingPositions: { top: number; left: number }[], minDistance: number): { top: number; left: number } {
  let position: { top: number; left: number };
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  while (true) {
    position = {
      top: Math.random() * (screenHeight - 100),
      left: Math.random() * (screenWidth - 100),
    };

    const isValid = !existingPositions.some(
      (pos) => Math.abs(pos.top - position.top) < minDistance && Math.abs(pos.left - position.left) < minDistance
    );

    if (isValid) {
      return position;
    }
  }
}

function generateRandomColor(): string {
  const colors = ['#00C100', '#0098E0', '#ED1B24', '#EADD00', '#6B00EB', '#FF7F00', '#B6E51D'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function generateRandomSize(): { width: number; height: number } {
  const size = Math.random() * 20 + 60;
  return { width: size, height: size };
}

function generateRandomVelocity(): { dx: number; dy: number } {
  const speed = Math.random() * 1 + 1; 
  const angle = Math.random() * 2 * Math.PI;
  return { dx: Math.cos(angle) * speed, dy: Math.sin(angle) * speed };
}

export default function DropCoin() {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [screenHeight, setScreenHeight] = useState(window.innerHeight);

  const [resizeTimeout, setResizeTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }

      const timeout = setTimeout(() => {
        setScreenWidth(window.innerWidth);
        setScreenHeight(window.innerHeight);
      }, 200);

      setResizeTimeout(timeout);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
    };
  }, [resizeTimeout]);

  useEffect(() => {
    const generateCoins = () => {
      const newCoins: CoinData[] = [];
      const existingPositions: { top: number; left: number }[] = [];

      for (let i = 0; i < 9; i++) {
        const position = generateRandomPosition(existingPositions, 100);
        const number = Math.floor(Math.random() * 100);
        const color = generateRandomColor();
        const size = generateRandomSize();
        const velocity = generateRandomVelocity();

        existingPositions.push(position);
        newCoins.push({
          number,
          color,
          position,
          size,
          velocity,
        });
      }

      setCoins(newCoins);
    };

    generateCoins();
  }, [screenWidth, screenHeight]);

  useEffect(() => {
    const moveCoins = () => {
      setCoins((prevCoins) =>
        prevCoins.map((coin) => {
          let newTop = coin.position.top + coin.velocity.dy;
          let newLeft = coin.position.left + coin.velocity.dx;

          if (newTop <= 0 || newTop >= screenHeight - coin.size.height) {
            coin.velocity.dy *= -1;
          }
          if (newLeft <= 0 || newLeft >= screenWidth - coin.size.width) {
            coin.velocity.dx *= -1;
          }

          return {
            ...coin,
            position: {
              top: Math.max(0, Math.min(screenHeight - coin.size.height, newTop)),
              left: Math.max(0, Math.min(screenWidth - coin.size.width, newLeft)),
            },
          };
        })
      );
    };

    const interval = setInterval(moveCoins, 16)
    return () => clearInterval(interval);
  }, [screenWidth, screenHeight]);

  return (
    <div className={styles.coinOverlay}>
      {coins.map((coin, index) => (
        <div
          key={index}
          className={styles.coinContainer}
          style={{
            top: coin.position.top,
            left: coin.position.left,
            position: 'absolute',
            width: coin.size.width,
            height: coin.size.height,
            backgroundColor: coin.color,
            borderRadius: '50%',
          }}
        ></div>
      ))}
    </div>
  );
}
