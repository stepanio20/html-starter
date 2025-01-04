import { initDataUser } from '@telegram-apps/sdk'
import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react'
import { useEffect } from "react"
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setUserId } from '../../slices/GameSlide'
import { RootState } from '../../store'
import styles from './style.module.css'

export function Home() {
  const navigate = useNavigate()
	const [tonConnectUI] = useTonConnectUI();
  const userFriendlyAddress = useTonAddress();
  const dispatch = useDispatch()
  const userGameId = useSelector((state: RootState) => state?.players?.userGameId)
  const telegram = initDataUser()

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
      if (!userFriendlyAddress) return
        const loginData = {
            WalletAddress: userFriendlyAddress,
            TelegramId: telegram?.id || 0,
        };

        const authenticateUser = async () => {
            try {
                const response = await fetch('http://localhost:5225/api/auth/sign-in', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(loginData),
                });

                const data:string = await response.json();
                dispatch(setUserId(data))
            } catch (error) {
                console.error(error);
            }
        };

        authenticateUser();
    }, [userFriendlyAddress]);

  return (
    <div className={styles?.menu}>
      <button 
      onClick={() => navigate('/game')}
      disabled={!userGameId}
      >
        Go to game
      </button>
      <button onClick={() => handleConnectWallet()}>Connect TON wallet</button>
			{userFriendlyAddress && (
				<button onClick={handleDisconnectWallet}>Disconnect TON wallet</button>
			)}
			{userFriendlyAddress}
    </div>
  )
}
