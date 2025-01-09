import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import useGetInfoApi from '../../../../../shared/api/get-info'
import { RootState } from '../../../../../store'
import styles from './styles.module.scss'

const GameOver = () => {
	const {balance, userId} = useSelector((root: RootState) => root.user)
	const navigate = useNavigate()
	const {getInfo} = useGetInfoApi()
	useEffect(() => {
		getInfo(userId)
	},[])
	return (
		<div className={styles.overlay}>
			<div className={styles.content}>
				<div className={styles.balance}>
					<p style={{margin: '0'}}>GAME OVER</p>
					<p style={{marginTop: '1vh'}}>${balance}</p>
				</div>
				<button 
				className={styles.return}
				onClick={() => navigate('/')}
				>
					Return
				</button>
			</div>
		</div>
	)
}

export default GameOver