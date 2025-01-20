import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import Joystick from '../../features/Joystick'
import PingCheck from '../../shared/utils/CheckPing'
import { drawGrid } from '../../shared/utils/DrawGrid'
import { drawMapBorders } from '../../shared/utils/DrawMapBorders'
import { formatTime } from '../../shared/utils/FormatTime'
import { getPlayers, Player, removePlayer, setPing, setPlayerId, updatePlayer } from '../../slices/GameSlide'
import { RootState } from '../../store'
import { PlayerBubble } from './classes/PlayerBubble'
import GameOver from './components/ui/GameOver'
import Minimap from './components/ui/MiniMap'
import MoveTimer from './components/ui/MoveTimer'
import WaitingPlayers from './components/ui/WaitingPlayers'
import styles from './style.module.css'

const App: React.FC = () => {
    const [gameRunning, setGameRunning] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [eatenPlayers, setEatenPlayers] = useState<Set<string>>(new Set());
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const joystickRef = useRef({ deltaX: 0, deltaY: 0 });
    const mapWidth = 12000;
    const mapHeight = 12000;
    const dispatch = useDispatch();
    const [connection, setConnection] = useState<HubConnection | null>(null);
    const players = useSelector(getPlayers);
    const {playerId} = useSelector((state: RootState) => state?.players);
    const {userId} = useSelector((state: RootState) => state?.user);
    const playersRef = useRef(players);
    const userGameIdRef = useRef(playerId);
    const navigate = useNavigate()
    const once = useRef(false)
    const [moveStatus, setMoveStatus] = useState<boolean>(false)
    const location = useLocation();
    const [waiting, setWaiting] = useState<boolean>(false)


    const { amount } = location.state || {}

    if (!amount) navigate(-1)

    useEffect(() => {
    if (!once.current) {
        initializeGame()
        once.current = true
    }
    },[])

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
            size: Math.sqrt(gameState.ballSize) * 15,
            value: gameState.ballSize,
            color: gameState.color,
        };

        dispatch(updatePlayer(player));
    };
    

    const playerBubble = useRef(new PlayerBubble(mapWidth / 2, mapHeight / 2, 0, 'red'));

    const initializeGame = () => {
        playerBubble.current.size = Math.sqrt(0);
        playerBubble.current.value = 0;
        setGameRunning(true);
        setGameOver(false);
        setEatenPlayers(new Set());
    };

    const endGame = () => {
        setGameRunning(false);
        setGameOver(true);
    }

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
        endAt: string
    }

    let lastPosition = { x: 0, y: 0 };

    let lastMoveTime = Date.now();
    let isInactive = false;
    
    const animate = () => {
        if (!gameRunning) return;
    
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        playerBubble.current.calculateSpeed();
    
    
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
    
        drawMapBorders(
            ctx,
            mapWidth,
            mapHeight,
            offsetX,
            offsetY,
            canvas.width,
            canvas.height 
        );
    
        playerBubble.current.draw(ctx, offsetX, offsetY, playerBubble.current.color);
    
        playersRef.current
            .filter(player => !eatenPlayers.has(player.id))
            .forEach((player) => {
                if (player.id !== playerId) {
                    const otherBubble = new PlayerBubble(player.x, player.y, player.value, player.color);
                    otherBubble.draw(ctx, offsetX, offsetY, player.color);
                }
            });

        handlePlayerCollision(playerBubble.current, playersRef.current);
        ctx.restore();
    
        const currentTime = Date.now();
    
        if (
            playerBubble.current.x !== lastPosition.x ||
            playerBubble.current.y !== lastPosition.y
        ) {
            lastMoveTime = currentTime;
            if (isInactive) {
                setMoveStatus(false);
                isInactive = false;
            }
    
            if (playerId) {
                sendPlayerPosition(
                    "f2940113-723e-4339-a32b-49d901b44b6c",
                    playerId,
                    playerBubble.current.x,
                    playerBubble.current.y,
                    playerBubble.current.size,
                );
    
                lastPosition = { x: playerBubble.current.x, y: playerBubble.current.y };
            }
        }
    
        if (currentTime - lastMoveTime > 10000 && !isInactive) {
            setMoveStatus(true);
            isInactive = true;
        }
    
        requestAnimationFrame(animate);
    };

    useEffect(() => {
        if (timeLeft === null) return;
    
        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev === null || prev <= 1) {
                    clearInterval(interval);
                    endGame();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    
        return () => clearInterval(interval);
    }, [timeLeft]);
    

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
        if (gameRunning && playerId) {
            animate();
        }
    }, [gameRunning, playerId]);

    useEffect(() => {
        playersRef.current = [...players];
        
        const currentPlayer = players.find(player => player.id === playerId);
        if (currentPlayer && currentPlayer.size !== playerBubble.current.size) {
            playerBubble.current.size = currentPlayer.size;
            playerBubble.current.value = currentPlayer.value;
        }
    }, [players, playerId]);

    useEffect(() => {
        userGameIdRef.current = playerId;
    }, [playerId]);

    const handleJoystickMove = (deltaX: number, deltaY: number) => {
        joystickRef.current.deltaX = deltaX;
        joystickRef.current.deltaY = deltaY;
    };

    const checkCollision = (player1: PlayerBubble, player2: PlayerBubble): boolean => {
        const dx = player1.x - player2.x;
        const dy = player1.y - player2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
    
        return distance < (player1.size + player2.size);
    };

    const handlePlayerCollision = (currentPlayer: PlayerBubble, players: Player[]) => {
        players.forEach(player => {
            if (player.id !== playerId && !eatenPlayers.has(player.id)) {
                const otherBubble = new PlayerBubble(player.x, player.y, player.value, player.color);
    
                if (checkCollision(currentPlayer, otherBubble)) {
                    if (currentPlayer.size > otherBubble.size) {
                        console.log(`Player ${playerId} ate player ${player.id}`);
                        connection?.invoke("EatPlayerAsync", playerId, player.id).catch(err => console.error("Error sending EatPlayerAsync: ", err));
                    }
                }
            }
        });
    };

    useEffect(() => {
        if (gameRunning) {
            const connection = new HubConnectionBuilder()
                .withUrl(`https://apiv2.camelracing.io/gameHub?userid=${userId}&amount=${amount}`)
                .build();

            setConnection(connection);
            
            connection.start().catch(err => console.error('Connection failed: ', err));

            connection.on('WaitingForPlayer', () => {
                setWaiting(true)
            })

            connection.on('Connected', (data: PlayerDto) => {
                if (data) {
                    playerBubble.current.x = data.positionX;
                    playerBubble.current.y = data.positionY;
                    playerBubble.current.size = data.ballSize;
                    playerBubble.current.value = Math.sqrt(data.ballSize) * 15;
                    playerBubble.current.color = data.color
                    dispatch(setPlayerId(data?.playerId));
                    const endTime = new Date(data.endAt).getTime();
                    const now = Date.now();
                    const remainingTime = Math.max(0, endTime - now);
                    setTimeLeft(Math.ceil(remainingTime / 1000));
                    setWaiting(false)
                }
                const clientTimestamp = Date.now();
                connection.invoke("CheckPing", clientTimestamp);
            });

            connection.on('PlayerEaten', (playerState: PlayerEatenDto) => {
                if (playerState.playerId === userGameIdRef.current) {
                    endGame()
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

            connection.on('receivePing', (ping: number) => {
              console.log(`ping ${ping}`);
              dispatch(setPing(ping))
            });

            return () => {
                if (connection) {
                    connection.stop();
                }
            };
        }
    }, [dispatch, gameRunning]);

    useEffect(() => {
        if (connection) {
            const getPing = async () => {
                const interval = setInterval(async () => {
                    const clientTimestamp = Date.now();
                    await connection.invoke("CheckPing", clientTimestamp);
                }, 5000);

                return () => clearInterval(interval);
            };

            getPing();
        }
    }, [connection]);

    return (
        <div>
                <div>
                    <p className={styles.playerOnline}>Players: {playersRef.current.length}</p>
                    <p className={styles.timer}>
                        Game Over: {timeLeft !== null ? formatTime(timeLeft) : 'Loading...'}
                    </p>
                    <canvas
                        ref={canvasRef}
                        width={window.innerWidth}
                        height={window.innerHeight}
                        style={{ backgroundColor: '#f0f0f0', display: "block", overflowY: 'hidden' }}
                    />
                     <Minimap
                        players={playersRef.current}
                        playerBubble={playerBubble.current}
                        mapWidth={mapWidth}
                        mapHeight={mapHeight}
                        PlayerId={playerId}
                    />
                    <Joystick onMove={handleJoystickMove} />
                </div>
                {gameOver && (
                    <GameOver/>
                )}
                {moveStatus && !gameOver && (
                    <MoveTimer setGameOver={setGameOver}/>
                )}
                {waiting && (
                    <WaitingPlayers/>
                )}
                <PingCheck/>
        </div>
    );
};

export default App;