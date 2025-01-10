import { useSelector } from 'react-redux'
import UsdIcon from '../../../assets/valute/usd.svg'
import { RootState } from '../../../store'
import styles from './style.module.scss'
export default function MenuHeader() {
	const {balance, demoBalance} = useSelector((state: RootState) => state?.user)
	return (
		<div className={styles.wrapper}>
			<div className={styles.content}>
				<div className={styles.player}>
					Player:
				</div>
				<div className={styles.balance}>
					{demoBalance.toFixed(2)}
					<img src={UsdIcon} alt="" />
				</div>
				<div className={styles.balance}>
					{balance}
					<img src={UsdIcon} alt="" />
				</div>
			</div>
		</div>
	)
}