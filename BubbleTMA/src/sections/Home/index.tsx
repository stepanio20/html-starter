import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react'
import { useEffect } from "react"
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import DepositModal from '../../features/DepositModal'
import PlayModal from '../../features/PlayModal'
import WithdrawModal from '../../features/WithdrawModal'
import useGetAddressApi from '../../shared/api/get-adress'
import useGetInfoApi from '../../shared/api/get-info'
import { useTelegram } from '../../shared/hooks/useTelegram'
import MenuHeader from '../../shared/ui/MenuHeader'
import { setUserId } from '../../slices/GameSlide'
import { RootState } from '../../store'
import DropCoin from './Coin'
import styles from './style.module.scss'
export function Home() {
  const navigate = useNavigate()
	const [tonConnectUI] = useTonConnectUI();
  const userFriendlyAddress = useTonAddress();
  const dispatch = useDispatch()
  const balance = useSelector((state: RootState) => state?.players?.balance)
  const {telegramId} = useTelegram()
  const {getInfo} = useGetInfoApi()
  const {getAddress} = useGetAddressApi()

 const handleConnectWallet = async () => {
    try {
      await tonConnectUI.connectWallet();
      console.log("Wallet connected successfully");
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  /* const handleDisconnectWallet = async () => {
    try {
      await tonConnectUI.disconnect();
      console.log("Wallet disconnected successfully");
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  }; */
  
  const goToGame = () => {
    if (balance > 0) {
      navigate('/game')
    }
  }

    useEffect(() => {
      if (!userFriendlyAddress) return

        const authenticateUser = async () => {
            try {
                const response = await fetch('https://lexcore.devmainops.store/api/auth/sign-in', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      WalletAddress: userFriendlyAddress,
                      TelegramId: telegramId,
                    }),
                });

                const data:string = await response.json();
                dispatch(setUserId(data))
                Promise.all([getInfo(data), getAddress()])
            } catch (error) {
                console.error(error);
            }
        };

        authenticateUser();
    }, [userFriendlyAddress]);

  return (
    <div>
        <MenuHeader/>
        <div className={`${styles.menuOverlay} ${window.innerWidth > window.innerHeight && styles.rorated}`}>
        {!userFriendlyAddress ? (
          <button onClick={() => handleConnectWallet()}>
          Connect TON wallet
          </button>
        ) : (
          <>
            <PlayModal/>
            <DepositModal/>
            <button 
              onClick={goToGame}
              disabled={true}
              className={styles.settingButton}
            >
              SETTINGS
            </button>
            <WithdrawModal/>
          </>
        )}
        </div>
        <DropCoin/>
    </div>
  )
}


/*  (
  <>
    <p>Balance: {balance}$</p>
    
    <button onClick={handleDisconnectWallet}>
    Disconnect TON wallet
    </button>
    <p className={styles.textContainer}>
      {userFriendlyAddress}
    </p>
    <div>
      <WithdrawModal/>
    </div>
  </>
) : (
  <button onClick={() => handleConnectWallet()}>
    Connect TON wallet
  </button>
)} */