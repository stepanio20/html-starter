import styles from './styles.module.scss'

export default function WaitingPlayers() {
	return (
		<div className={styles.overlay}>
				<div className={styles.content}>
					<p style={{ margin: '0' }}>We’re waiting for one more player.</p>
				</div>
		</div>
	)
}