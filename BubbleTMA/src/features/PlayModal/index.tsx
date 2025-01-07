import { useState } from "react"
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import usdIcon from '../../assets/valute/usd.svg'
import { RootState } from '../../store'
import styles from "./style.module.scss"

const PlayModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState<string | number>("")
  const balance = useSelector((state: RootState) => state?.players?.balance);
  const navigate = useNavigate()
  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const isAmountValid = () => {
    const numericAmount = parseFloat(amount as string);
    return !isNaN(numericAmount) && numericAmount >= 0.1 && numericAmount <= balance;
  };

  const startGame = () => {
    navigate('/game', {state: {amount}})
  }

  return (
      <>
        <button
            onClick={toggleModal}
            className={styles.playButton}>
          PLAY PVP
        </button>

        <div className={`${styles.modalOverlay} ${isOpen ? styles.active : ""}`}>
          <div className={styles.modalContent}>
            <button className={styles.modalClose} onClick={toggleModal}>
              &times;
            </button>
            <p className={styles.title}>PLAY</p>
            <div className={styles.balance}>
              <img src={usdIcon} alt="" />
              <p>{balance}</p>
            </div>
            <div className={styles.fill}>
              <div>
                <input
                    type="number"
                    placeholder='Enter the amount'
                    value={amount}
                    onChange={handleAmountChange} />
              </div>
              <button
                  className={styles.confirmButton}
                  disabled={!isAmountValid()}
                  onClick={() => startGame()}
              >
                CONFIRM
              </button>
            </div>
          </div>
        </div>
      </>
  );
};

export default PlayModal;
