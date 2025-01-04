import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Joystick from '../../features/Joystick'
import { getPlayers, Player, removePlayer, setPlayerId, updatePlayer } from '../../slices/GameSlide'
import { RootState } from '../../store'
import styles from './style.module.css'

const App: React.FC = () => {
   /*  const [playerBalance, setPlayerBalance] = useState(0); */
   /*  const [gameTime, setGameTime] = useState(40); */
    const [gameRunning, setGameRunning] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [eatenPlayers, setEatenPlayers] = useState<Set<string>>(new Set());
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const timerRef = useRef<number | null>(null);
    const joystickRef = useRef({ deltaX: 0, deltaY: 0 });
    const mapWidth = 4000;
    const mapHeight = 4000;
    const dispatch = useDispatch();
    const [connection, setConnection] = useState<HubConnection | null>(null);
    const players = useSelector(getPlayers);
    const PlayerId = useSelector((state: RootState) => state?.players?.playerId);
    const userId = useSelector((state: RootState) => state?.players?.userId);
    const balance = useSelector((state: RootState) => state?.players?.balance);
    const playersRef = useRef(players);
    const userGameIdRef = useRef(PlayerId);
    const navigate = useNavigate()

    useEffect(() => {
        if (!userId) {
            navigate('/')
        }
    })

    const handlePlayerUpdate = (gameState: PlayerDto) => {
        const player: Player = {
            id: gameState.playerId,
            x: gameState.positionX,
            y: gameState.positionY,
            size: gameState.ballSize * 1500,
            value: gameState.ballSize,
            color: gameState.color,
        };

        dispatch(updatePlayer(player));
    };

    class PlayerBubble {
        x: number;
        y: number;
        size: number;
        value: number;
        speed: number;
        color: string;

        constructor(x: number, y: number, value: number, color: string) {
            this.x = x;
            this.y = y;
            this.value = value;
            this.size = value * 1500;
            this.speed = 0.2;
            this.color = color;
        }

        draw(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number, color: string) {
            ctx.beginPath();
            ctx.arc(this.x - offsetX, this.y - offsetY, this.size, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.closePath();

            ctx.fillStyle = "#000";
            ctx.font = `14px Arial`;
            ctx.textAlign = "center";
            ctx.fillText(`$${this.value.toFixed(2)}`, this.x - offsetX, this.y - offsetY + 5);
        }
    }

    const playerBubble = useRef(new PlayerBubble(mapWidth / 2, mapHeight / 2, /* playerBalance */ 0, 'red'));

    const initializeGame = () => {
        playerBubble.current.size = Math.sqrt(0);
        playerBubble.current.value = 0;
        /* setGameTime(40); */
        setGameRunning(true);
        setGameOver(false);
        setEatenPlayers(new Set());
        startTimer();
    };

    const startTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);

        timerRef.current = setInterval(() => {
            if (gameOver || !gameRunning) {
                clearInterval(timerRef.current!);
                return;
            }

           /*  setGameTime((prevTime) => {
                if (prevTime <= 1) {
                    endGame();
                    return 0;
                }
                return prevTime - 1;
            }); */
        }, 1000);
    };

   /*  const endGame = () => {
        setGameRunning(false);
        setGameOver(true);
    }; */

    const checkCollisions = () => {
        // Collision logic
    };

    interface PlayerEatenDto {
        gameId: string;
        playerId: string;
    }

    interface PlayerDto {
        gameId: string;
        playerId: string;
        positionX: number;
        positionY: number;
        ballSize: number;
        color: string;
    }

   /*  let lastSentTime = 0;
    const sendInterval = 100; */
    let lastPosition = { x: 0, y: 0 };

   /*  const getRandomColor = (): string => {
        const hue = Math.floor(Math.random() * 360);
        return `hsl(${hue}, 70%, 50%)`;
    }; */

    const animate = () => {
        if (!gameRunning) return;
    
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        const isMobile = window.innerWidth < 768;
        const scale = isMobile ? 0.7 : 1;
    
        ctx.save();
        ctx.scale(scale, scale);
    
        const offsetX = playerBubble.current.x - (canvas.width / 2) / scale;
        const offsetY = playerBubble.current.y - (canvas.height / 2) / scale;
    
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
    
        playerBubble.current.draw(ctx, offsetX, offsetY, playerBubble.current.color);
    
        playersRef.current
            .filter(player => !eatenPlayers.has(player.id))
            .forEach((player) => {
                if (player.id !== PlayerId) {
                    const otherBubble = new PlayerBubble(player.x, player.y, player.value, player.color);
                    otherBubble.draw(ctx, offsetX, offsetY, player.color);
                }
            });
    
        ctx.restore();
    
        if (
            playerBubble.current.x !== lastPosition.x ||
            playerBubble.current.y !== lastPosition.y 
        ) {
            if (PlayerId) {
                sendPlayerPosition(
                    "f2940113-723e-4339-a32b-49d901b44b6c",
                    PlayerId,
                    playerBubble.current.x,
                    playerBubble.current.y,
                    playerBubble.current.size,
                );
    
                lastPosition = { x: playerBubble.current.x, y: playerBubble.current.y };
            }
        }
    
        checkCollisions();
        requestAnimationFrame(animate);
    };
    

    const sendPlayerPosition = (gameId: string, playerId: string, x: number, y: number, ballSize: number) => {
        const playerDto = {
            GameId: gameId,
            PlayerId: playerId,
            PositionX: x,
            PositionY: y,
            BallSize: ballSize
        };

        connection?.invoke("UpdatePlayerPosition", playerDto)
            .catch(err => console.error(err.toString()));
    };


    useEffect(() => {
        if (gameRunning && PlayerId) {
            animate();
        }
    }, [gameRunning, PlayerId]);

    useEffect(() => {
        playersRef.current = [...players];
        
        const currentPlayer = players.find(player => player.id === PlayerId);
        if (currentPlayer && currentPlayer.size !== playerBubble.current.size) {
            playerBubble.current.size = currentPlayer.size;
            playerBubble.current.value = currentPlayer.value;
        }
    }, [players, PlayerId]);

    useEffect(() => {
        userGameIdRef.current = PlayerId;
    }, [PlayerId]);

    const handleJoystickMove = (deltaX: number, deltaY: number) => {
        joystickRef.current.deltaX = deltaX;
        joystickRef.current.deltaY = deltaY;
    };


    
    useEffect(() => {
        if (gameRunning) {
            const connection = new HubConnectionBuilder()
                .withUrl(`https://lexcore.devmainops.store/gameHub?userid=${userId}`)
                .build();

            setConnection(connection);
            
            connection.start().catch(err => console.error('Connection failed: ', err));

            connection.on('Connected', (data: PlayerDto) => {
                if (data) {
                    playerBubble.current.x = data.positionX;
                    playerBubble.current.y = data.positionY;
                    playerBubble.current.size = data.ballSize;
                    playerBubble.current.value = data.ballSize * 1500;
                    playerBubble.current.color = data.color
                    dispatch(setPlayerId(data?.playerId));
                }
            });

            connection.on('PlayerEaten', (playerState: PlayerEatenDto) => {
                if (playerState.playerId === userGameIdRef.current) {
                    console.log("You have been eaten!");
                    navigate('/')
                } else if (playerState.playerId) {
                    console.log("Removing player with ID:", playerState.playerId);
                    setEatenPlayers(prev => new Set(prev.add(playerState.playerId)));
                    dispatch(removePlayer(playerState.playerId));
                }
            });

            connection.on('PlayerDisconnected', (playerState: PlayerEatenDto) => {
                if (playerState.playerId === userGameIdRef.current) {
                    navigate('/')
                } else if (playerState.playerId) {
                    dispatch(removePlayer(playerState.playerId));
                }
            });

            connection.on('PlayerPositionUpdated', (gameState: PlayerDto) => {
                console.log(gameState)
                if (!gameState.playerId || gameState.positionY === undefined || gameState.positionX === undefined) {
                    console.error("Ошибка: данные игрока некорректны", gameState);
                    return;
                }
                if (eatenPlayers.has(gameState.playerId)) {
                    console.log(`Игрок с ID ${gameState.playerId} уже был съеден, обновление данных не требуется.`);
                    return;
                }

                handlePlayerUpdate(gameState);
            });

            return () => {
                if (connection) {
                    connection.stop();
                }
            };
        }
    }, [dispatch, gameRunning]);

    return (
        <div>
            {gameRunning ? (
                <div className={styles.canvasContainer}>
                    <canvas
                        ref={canvasRef}
                        width={window.innerWidth}
                        height={window.innerHeight}
                        style={{ backgroundColor: '#f0f0f0', display: "block" }}
                    />
                    <Joystick onMove={handleJoystickMove} />
                </div>
            ) : (
                <div id="menu" style={{ textAlign: 'center', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
                    <h1>Bubble Game</h1>
                    <div>Balance: {balance}$</div>
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
