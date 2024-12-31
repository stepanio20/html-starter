import React from 'react'

interface MenuProps {
    startGame: () => void;
}

const Menu: React.FC<MenuProps> = ({ startGame }) => {
    return (
        <div>
            <h1>Bubble Game</h1>
            <button onClick={startGame}>Play</button>
        </div>
    );
};

export default Menu;
