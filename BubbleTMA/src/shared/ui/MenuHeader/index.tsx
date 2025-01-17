import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import PointIcon from '../../../assets/valute/points.svg'
import UsdIcon from '../../../assets/valute/usd.svg'
import { RootState } from '../../../store'
import useGetPlayersApi from '../../api/get-players'
import styles from './style.module.scss'
export default function MenuHeader() {
	const {balance, demoBalance, PlayersOnline} = useSelector((state: RootState) => state?.user)
	const {getPlayersOnline} = useGetPlayersApi()
	useEffect(() => {
		getPlayersOnline()
	},[])
	return (
		<div className={styles.wrapper}>
			<div className={styles.content}>
				<div className={styles.player}>
					Players: {PlayersOnline}
				</div>
				<div className={styles.pointBalance}>
					{demoBalance.toFixed(2)}
					<img src={PointIcon} alt="" />
				</div>
				<div className={styles.balance}>
					{balance}
					<img src={UsdIcon} alt="" />
				</div>
			</div>
		</div>
	)
}