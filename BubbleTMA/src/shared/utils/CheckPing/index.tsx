import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'

const PingCheck: React.FC = () => {
  const { ping } = useSelector((state: RootState) => state.players);

  let pingColor = 'green';
  if (ping !== null) {
    if (ping > 200) {
      pingColor = 'red';
    } else if (ping > 150) {
      pingColor = 'yellow';
    }
  }

  return (
    <div style={{ position: 'absolute', right: '10px', top: '250px' }}>
      {ping !== null && (
        <p style={{ color: pingColor }}>Ping: {ping} ms</p>
      )}
    </div>
  );
};

export default PingCheck;
