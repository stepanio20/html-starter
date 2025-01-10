import { useTonAddress } from '@tonconnect/ui-react'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import useGetDemoCoinApi from '../../../../shared/api/get-demoCoin'
import { useTelegram } from '../../../../shared/hooks/useTelegram'
import { RootState } from '../../../../store'
import styles from './styles.module.scss'

const GameOver = () => {
	const {demoBalance, userId} = useSelector((root: RootState) => root.user)
	const navigate = useNavigate()
	const {getDemoCoin, getDemoWithoutAuth} = useGetDemoCoinApi()
	const {telegramId} = useTelegram()
	const userFriendlyAddress = useTonAddress()
	useEffect(() => {
		let uuId = localStorage.getItem('userId')
    if (telegramId || userFriendlyAddress) {
      getDemoCoin(userId)
    } else if (uuId) {
      getDemoWithoutAuth(uuId)
    }
	},[])
	return (
		<div className={styles.overlay}>
			<div className={styles.content}>
				<div className={styles.balance}>
					<p style={{margin: '0'}}>GAME OVER</p>
					<p style={{marginTop: '1vh'}}>{demoBalance.toFixed(2)}$</p>
				</div>
				<div style={
					{width: '100%',
					display: 'flex',
				  justifyContent: 'center'}
					}>
					<button 
					className={styles.return}
					onClick={() => navigate('/')}
					>
						Return
					</button>
				</div>
			</div>
		</div>
	)
}

export default GameOver