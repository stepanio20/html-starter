import { useNavigate } from 'react-router-dom'
import styles from './style.module.css'
export function Home() {
	const navigate = useNavigate()
	return (
		<div className={styles?.menu}>
			<h1>Bubble Game</h1>
			<div>Balance: $10.00</div>
			<button onClick={() => navigate('/game')}>Play</button>
		</div>
	)
}