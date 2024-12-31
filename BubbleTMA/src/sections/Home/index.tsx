import { useNavigate } from 'react-router-dom'
import styles from './style.module.css'
export function Home() {
	const navigate = useNavigate()
	return (
		<div className={styles?.menu}>
			<button onClick={() => navigate('/game')}>Go to game</button>
		</div>
	)
}