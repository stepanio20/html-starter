import { useEffect, useState } from 'react'
import styles from './styles.module.scss'
interface Props {
	setGameOver: React.Dispatch<React.SetStateAction<boolean>>
}
const MoveTimer = ({setGameOver}:Props) => {
    const [countdown, setCountdown] = useState(10);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
				if (countdown === 0) {
					setGameOver(true)
				}
    }, [countdown]);

    return (
        <div className={styles.overlay}>
            <div className={styles.content}>
                <div className={styles.balance}>
                    <p style={{ margin: '0' }}>MOVE</p>
                    <p style={{ margin: '0' }}>{countdown}</p>
                </div>
            </div>
        </div>
    );
};

export default MoveTimer;
