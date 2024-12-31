import React from 'react'

interface GameUIProps {
    balance: number;
    time: number;
}

const GameUI: React.FC<GameUIProps> = ({ balance, time }) => {
    return (
        <div>
            <div>Balance: ${balance.toFixed(2)}</div>
            <div>Time Left: {time}</div>
        </div>
    );
};

export default GameUI;
