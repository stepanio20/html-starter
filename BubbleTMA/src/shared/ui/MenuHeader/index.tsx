import { useSelector } from 'react-redux'
import UsdIcon from '../../../assets/valute/usd.svg'
import { RootState } from '../../../store'
import styles from './style.module.scss'
export default function MenuHeader() {
	const balance = useSelector((state: RootState) => state?.players?.balance)
	return (
		<div className={styles.wrapper}>
			<div className={styles.content}>
				<div className={styles.player}>
					Player:
				</div>
				<div className={styles.balance}>
					{balance}
					<img src={UsdIcon} alt="" />
				</div>
			</div>
		</div>
	)
}