import RotateIcon from '../../assets/rotatePhone.png'
import styles from './style.module.scss'
export default function RotatePhone() {
	return (
		<div className={styles.overlay}>
			<div className={styles.content}>
				<p>Please rotate your phone.</p>
				<img src={RotateIcon} alt="" />
			</div>
		</div>
	)
}