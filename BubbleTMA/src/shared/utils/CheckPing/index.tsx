import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'


const PingCheck: React.FC = () => {
  const {ping} = useSelector((state:RootState)=>state.players)
  return (
    <div style={{position: 'absolute', right: '10px', top: '250px'}}>
      {ping !== null && (
        <p>Пинг: {ping} мс</p>
      )}
    </div>
  );
};

export default PingCheck;
