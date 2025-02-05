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
import { setGameId } from '../../slices/UserSlide'
import { RootState } from '../../store'
import { PlayerBubble } from './classes/PlayerBubble'
import GameOver from './components/ui/GameOver'
import Minimap from './components/ui/MiniMap'
import MoveTimer from './components/ui/MoveTimer'
import WaitingPlayers from './components/ui/WaitingPlayers'
import { generateBinoculars } from './GameItems/GameObject'
import styles from './style.module.css'

interface ParticlesInt {
    Id: string,
    PositionX:number,
    PositionY:number,
    color: string,
    Size: number
}

interface MagnetInt {
    id: string,
    positionX:number,
    positionY:number
}

const App: React.FC = () => {
    const [gameRunning, setGameRunning] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [eatenPlayers, setEatenPlayers] = useState<Set<string>>(new Set());
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const joystickRef = useRef({ deltaX: 0, deltaY: 0 });
    const mapWidth = 4000;
    const mapHeight = 4000;
    const dispatch = useDispatch();
    const [connection, setConnection] = useState<HubConnection | null>(null);
    const players = useSelector(getPlayers);
    const {playerId} = useSelector((state: RootState) => state?.players);
    const {userId, gameId} = useSelector((state: RootState) => state?.user);
    const playersRef = useRef(players);
    const userGameIdRef = useRef(playerId);
    const navigate = useNavigate()
    const once = useRef(false)
    const [moveStatus, setMoveStatus] = useState<boolean>(false)
    const location = useLocation();
    const [waiting, setWaiting] = useState<boolean>(false)
    const particlesRef = useRef<ParticlesInt[]>([]);
    const binocularsRef = useRef<{ x: number, y: number, size: number }[]>([]);
    const zoomedOutRef = useRef(false);
    const magnetsRef = useRef<MagnetInt[]>([]);
    const boosting = useRef(false)


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
            size: Math.sqrt(gameState.deposit) * 15,
            value: gameState.deposit,
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
        const binoculars = generateBinoculars(300, mapWidth, mapHeight);
        binocularsRef.current = binoculars
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
        deposit:number,
        dusts:number
    }

    let lastPosition = { x: 0, y: 0 };

    let lastMoveTime = Date.now();
    let isInactive = false;
    const handleParticleCollision = () => {
        particlesRef.current.forEach((particle) => {
            const dx = playerBubble.current.x - particle.PositionX;
            const dy = playerBubble.current.y - particle.PositionY;
            const distance = Math.sqrt(dx * dx + dy * dy);
    
            if (distance < playerBubble.current.size) {
                console.log(particle.Id);
                
                connection?.invoke("EatDustAsync", playerId, particle.Id)
                    .catch(err => console.error(err.toString()));
            }
        });
    };
    

    const activateZoomOut = () => {
        if (zoomedOutRef.current) return;
    
        zoomedOutRef.current = true
    
        setTimeout(() => {
            zoomedOutRef.current = false;
        }, 10000);
    };
    
    const handleBinocularCollision = () => {
        let updatedBinoculars = binocularsRef.current.filter((binocular) => {
            const dx = playerBubble.current.x - binocular.x;
            const dy = playerBubble.current.y - binocular.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
    
            if (distance < playerBubble.current.size) {
                activateZoomOut();
                return false;
            }
            return true;
        });
    
        binocularsRef.current = updatedBinoculars;
    };
    
    const checkMagnetCollision = () => {
        magnetsRef.current.forEach((magnet, index) => {
            const dx = playerBubble.current.x - magnet.positionX;
            const dy = playerBubble.current.y - magnet.positionY;
            const distance = Math.sqrt(dx * dx + dy * dy);
    
            if (distance < 20) {
                connection?.invoke("EatMagnetAsync", playerId, magnet.id)
                .catch(err => console.error(err.toString()));
                magnetsRef.current.splice(index, 1);
            }
        });
    };

    let lastTime = 0;
    const targetFPS = 60;
    const targetFrameDuration = 1000 / targetFPS;

    const animate = (time: number) => {
        const deltaTime = time - lastTime;
    
        if (deltaTime >= targetFrameDuration) {
            lastTime = time;
    
            if (!gameRunning) return;
    
            const canvas = canvasRef.current!;
            const ctx = canvas.getContext("2d")!;
    
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            const scale = zoomedOutRef.current ? 0.7 : 1;
            ctx.scale(scale, scale);
    
            playerBubble.current.calculateSpeed();
            let speedMultiplier = boosting.current ? 2 : 1;
            playerBubble.current.x += joystickRef.current.deltaX * playerBubble.current.speed * 5 * speedMultiplier;
            playerBubble.current.y += joystickRef.current.deltaY * playerBubble.current.speed * 5 * speedMultiplier;
            playerBubble.current.x = Math.max(playerBubble.current.size, Math.min(playerBubble.current.x, mapWidth - playerBubble.current.size));
            playerBubble.current.y = Math.max(playerBubble.current.size, Math.min(playerBubble.current.y, mapHeight - playerBubble.current.size));
    
            const offsetX = playerBubble.current.x - (canvas.width / 2) / scale;
            const offsetY = playerBubble.current.y - (canvas.height / 2) / scale;
    
            drawGrid(ctx, canvas.width / scale, canvas.height / scale, 100, offsetX, offsetY, playerBubble.current.size, 3);
    
            particlesRef.current.forEach((particle) => {
                const alpha = Math.abs(Math.sin(Date.now() / 200));
    
                ctx.beginPath();
                ctx.arc(particle.PositionX - offsetX, particle.PositionY - offsetY, particle.Size, 0, Math.PI * 2);
                ctx.fillStyle = particle.color;
                ctx.globalAlpha = alpha;
                ctx.fill();
                ctx.closePath();
                ctx.globalAlpha = 1;
            });
    
            magnetsRef.current.forEach((magnet) => {
                const screenX = magnet.positionX - offsetX;
                const screenY = magnet.positionY - offsetY;
                ctx.beginPath();
                ctx.arc(screenX, screenY, 50, 0, Math.PI * 2);
                ctx.fillStyle = "#FF6347";
                ctx.fill();
                ctx.closePath();
            });
    
            binocularsRef.current.forEach((binocular) => {
                ctx.beginPath();
                ctx.arc(binocular.x - offsetX, binocular.y - offsetY, binocular.size, 0, Math.PI * 2);
                ctx.fillStyle = "#8A2BE2";
                ctx.fill();
                ctx.closePath();
            });
    
            checkMagnetCollision();
            handleBinocularCollision();
            handleParticleCollision();
    
            drawMapBorders(
                ctx,
                mapWidth,
                mapHeight,
                offsetX,
                offsetY,
                canvas.width / scale,
                canvas.height / scale
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
    
            const currentTime = Date.now();
            if (playerBubble.current.x !== lastPosition.x || playerBubble.current.y !== lastPosition.y) {
                lastMoveTime = currentTime;
                if (isInactive) {
                    setMoveStatus(false);
                    isInactive = false;
                }
    
                if (playerId) {
                    sendPlayerPosition(
                        gameId,
                        playerId,
                        playerBubble.current.x,
                        playerBubble.current.y,
                        playerBubble.current.size
                    );
                    lastPosition = { x: playerBubble.current.x, y: playerBubble.current.y };
                }
            }
    
            if (currentTime - lastMoveTime > 10000 && !isInactive) {
                setMoveStatus(true);
                isInactive = true;
            }
    
            ctx.restore();
    
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
    

    let requestCount = 0;
    const MAX_REQUESTS_PER_SECOND = 60;

    setInterval(() => {
        requestCount = 0;
    }, 1000);

    const sendPlayerPosition = (gameId: string, playerId: string, x: number, y: number, ballSize: number) => {
        if (requestCount < MAX_REQUESTS_PER_SECOND) {
            const playerDto = {
                GameId: gameId,
                PlayerId: playerId,
                PositionX: x,
                PositionY: y,
                BallSize: ballSize
            };

            connection?.invoke("UpdatePlayerPosition", playerDto)
                .catch(err => console.error(err.toString()));

            requestCount++;
        } else {
            console.log('Превышен лимит запросов на эту секунду');
        }
    };

    useEffect(() => {
        if (gameRunning && playerId) {
            requestAnimationFrame(animate);
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

    const handleMagnetAttraction = (eatenParticles: ParticlesInt[]) => {
        const eatenIds = new Set(eatenParticles.map(p => p.Id));
    
        const animate = () => {
            let hasActiveParticles = false;
    
            particlesRef.current.forEach((particle, index) => {
                if (!eatenIds.has(particle.Id)) return;
    
                const dx = playerBubble.current.x - particle.PositionX;
                const dy = playerBubble.current.y - particle.PositionY;
                const distance = Math.sqrt(dx * dx + dy * dy);
    
                const angle = Math.atan2(dy, dx);
                const force = Math.min(2, distance / 20);
    
                particle.PositionX+= Math.cos(angle) * force;
                particle.PositionY += Math.sin(angle) * force;
    
                if (distance > 5) {
                    hasActiveParticles = true;
                } else {
                    particlesRef.current.splice(index, 1);
                }
            });
    
            if (hasActiveParticles) {
                requestAnimationFrame(animate);
            }
        };
    
        animate();
    };

    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };
    

    useEffect(() => {
        if (gameRunning) {
            const connection = new HubConnectionBuilder()
                .withUrl(`http://localhost:5225/gameHub?userid=${userId}&amount=${amount}`)
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
                    playerBubble.current.size = data.deposit;
                    playerBubble.current.value = Math.sqrt(data.deposit) * 15;
                    playerBubble.current.color = data.color
                    dispatch(setPlayerId(data?.playerId));
                    dispatch(setGameId(data?.gameId))
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

            connection.on('NewDustCreated', (particleState: ParticlesInt[] | ParticlesInt) => {
                if (!particlesRef.current) {
                    particlesRef.current = [];
                }

                console.log(particleState);
                console.log(Array.isArray(particleState));
                if (Array.isArray(particleState)) {
                    particleState.forEach(newParticle => {
                        newParticle.color = getRandomColor();
                        
                        const existingIndex = particlesRef.current.findIndex(p => p.Id === newParticle.Id);
                        
                        if (existingIndex !== -1) {
                            particlesRef.current[existingIndex] = newParticle;
                        } else {
                            particlesRef.current.push(newParticle);
                        }
                    });
                } else {
                    particleState.color = getRandomColor();
                    
                    particlesRef.current = particlesRef.current.filter(p => p.Id !== particleState.Id);
                    particlesRef.current.push(particleState);
                }
            });
            
            connection.on("DustEaten", (particleState: ParticlesInt[]) => {
                handleMagnetAttraction(particleState);
            });

            connection.on('MagnetCreated', (magnetState: MagnetInt[]) => {
                if (!particlesRef.current) {
                    particlesRef.current = [];
                }
                magnetsRef.current = magnetState
            });
            
            connection.on('PlayerDisconnected', (playerState: PlayerEatenDto) => {
                if (playerState.playerId === userGameIdRef.current) {
                    navigate('/')
                } else if (playerState.playerId) {
                    dispatch(removePlayer(playerState.playerId));
                }
            });

            connection.on('PlayerPositionUpdated', (gameState: PlayerDto) => {
                if (!gameState.playerId || gameState.positionY === undefined || gameState.positionX === undefined) {
                    return;
                }
                if (eatenPlayers.has(gameState.playerId)) {
                    console.log(`Игрок с ID ${gameState.playerId} уже был съеден, обновление данных не требуется.`);
                    return;
                }

                handlePlayerUpdate(gameState);
            });

            connection.on('receivePing', (ping: number) => {
              dispatch(setPing(ping))
            });

            connection.on('MagnetEaten', (id: string) => {
                magnetsRef.current = magnetsRef.current.filter(magnet => magnet.id !== id);
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
                    <button 
                        className={styles.boostButton} 
                        onClick={() => boosting.current = true}
                    >
                        BOOST
                    </button>
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