import { useEffect, useState } from "react"
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import DepositModal from '../../features/DepositModal'
import PlayFunModal from '../../features/PlayFunModal'
import PlayModal from '../../features/PlayModal'
import WithdrawModal from '../../features/WithdrawModal'
import MenuHeader from '../../shared/ui/MenuHeader'
import { setPlayers } from '../../slices/GameSlide'
import { RootState } from '../../store'
import DropCoin from './Coin'
import styles from './style.module.scss'




export function Home() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const {balance, userId} = useSelector((state: RootState) => state?.user)
  const [isLandscape, setIsLandscape] = useState<boolean>(window.innerWidth > window.innerHeight);
  let isMob = window.innerHeight <= 431

  const checkOrientation = () => {
    setIsLandscape(window.innerWidth > window.innerHeight);
  };

  useEffect(() => {
    dispatch(setPlayers([]))
  },[])

  useEffect(() => {
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  const goToGame = () => {
    if (balance > 0) {
      navigate('/game')
    }
  }

  return (
    <div>
      <MenuHeader/>
      <div className={`${styles.menuOverlay} ${!isLandscape && styles.rotated}`}>
        {!userId ? (
          <>
            <DepositModal/>
            <PlayFunModal/>
          </>
        ) : isMob ? (
          <>
          <PlayModal/>
          <PlayFunModal/>
          <button 
            onClick={goToGame}
            disabled={true}
            className={styles.settingButton}
          >
            SETTINGS
          </button>
          <div className={styles.isMobile}>
            <DepositModal/>
            <WithdrawModal/>
          </div>
        </>
        ) : (
          <>
          <PlayModal/>
          <PlayFunModal/>
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
        )
        }
      </div>
      <DropCoin/>
    </div>
  )
}
