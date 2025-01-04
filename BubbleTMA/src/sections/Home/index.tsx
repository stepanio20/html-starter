import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react'
import { useNavigate } from 'react-router-dom'
import styles from './style.module.css'
import {useEffect} from "react";

export function Home() {
  const navigate = useNavigate()
	const [tonConnectUI] = useTonConnectUI();
  const userFriendlyAddress = useTonAddress();

 const handleConnectWallet = async () => {
    try {
      await tonConnectUI.connectWallet();
      console.log("Wallet connected successfully");
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      await tonConnectUI.disconnect();
      console.log("Wallet disconnected successfully");
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  };

    useEffect(() => {
        const loginData = {
            WalletAddress: 'test',
            TelegramId: '65234',
        };

        const authenticateUser = async () => {
            try {
                const response = await fetch('https://localhost:7073/api/auth/sign-in', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(loginData),
                });

                const data = await response.json();
                console.log(data);
            } catch (error) {
                console.error(error);
            }
        };

        authenticateUser();
    }, []);

  return (
    <div className={styles?.menu}>
      <button onClick={() => navigate('/game')}>Go to game</button>
      <button onClick={() => handleConnectWallet()}>Connect TON wallet</button>
			{userFriendlyAddress && (
				<button onClick={handleDisconnectWallet}>Disconnect TON wallet</button>
			)}
			{userFriendlyAddress}
    </div>
  )
}
