import { useState } from "react"
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import close from '../../assets/close.svg'
import usdIcon from '../../assets/valute/usd.svg'
import { RootState } from '../../store'
import styles from "./style.module.scss"
const PlayModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState<string | number>("");
  const balance = useSelector((state: RootState) => state?.user?.balance);
  const navigate = useNavigate();

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
    return !isNaN(numericAmount) && numericAmount >= 1 && numericAmount <= 10 && numericAmount <= balance;
  };

  const startGame = () => {
    navigate('/game', { state: { amount } });
  };

  const setAmountByPercentage = (percentage: number) => {
    const calculatedAmount = (balance * percentage) / 100;
    setAmount(calculatedAmount.toFixed(2));
  };

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
            <img src={close} alt="" style={{width: '50px', height: '50px'}} />
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
            <p 
            style={{fontSize: '12px', marginTop: '15px', maxWidth: '320px', opacity: '55%', color: 'black'}}>
              Deposits are limited 1-10$
            </p>
            <div className={styles.percentageButtons}>
              <button onClick={() => setAmountByPercentage(10)}>10%</button>
              <button onClick={() => setAmountByPercentage(25)}>25%</button>
              <button onClick={() => setAmountByPercentage(50)}>50%</button>
              <button onClick={() => setAmountByPercentage(100)}>100%</button>
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
