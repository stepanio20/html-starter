import { useState } from "react"
import { useSelector } from 'react-redux'
import close from '../../assets/close.svg'
import usdIcon from '../../assets/valute/usd.svg'
import useGetInfoApi from "../../shared/api/get-info.ts"
import { RootState } from '../../store'
import useWithdrawApi from './api'
import styles from "./style.module.css"
const WithdrawModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState<string | number>("");
  const {balance, userId} = useSelector((state: RootState) => state?.user);
  const { withdraw } = useWithdrawApi();
  const [loading, setLoading] = useState<boolean>(false);
  const { getInfo } = useGetInfoApi();


  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handlePercentageClick = (percentage: number) => {
    if (balance) {
      const calculatedAmount = (balance * percentage) / 100;
      setAmount(calculatedAmount.toFixed(2));
    }
  };

  const isAmountValid = () => {
    const numericAmount = parseFloat(amount as string);
    return !isNaN(numericAmount) && numericAmount > 0 && numericAmount <= balance;
  };

  const handleWithdraw = async () => {
    if (!userId) return;
    setLoading(true);
    setIsOpen(false);
    await withdraw(userId, Number(amount));
    await getInfo(userId);
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={toggleModal}
        className={styles.withdrawButton}>
        WITHDRAW
      </button>

      <div className={`${styles.modalOverlay} ${isOpen ? styles.active : ""}`}>
        <div className={styles.modalContent}>
          <button className={styles.modalClose} onClick={toggleModal}>
            <img src={close} alt="" style={{width: '50px', height: '50px'}} />
          </button>
          <p className={styles.title}>WITHDRAW</p>
          <div className={styles.balance}>
            <img src={usdIcon} alt="" />
            <p>{balance}</p>
          </div>
          <div className={styles.fill}>
            <div>
              <input
                type="number"
                placeholder="Enter the amount"
                value={amount}
                onChange={handleAmountChange} />
            </div>
            <div className={styles.percentageButtons}>
              <button onClick={() => handlePercentageClick(10)}>10%</button>
              <button onClick={() => handlePercentageClick(25)}>25%</button>
              <button onClick={() => handlePercentageClick(50)}>50%</button>
              <button onClick={() => handlePercentageClick(100)}>100%</button>
            </div>
            <button
              className={styles.confirmButton}
              disabled={!isAmountValid() || loading}
              onClick={() => handleWithdraw()}
            >
              CONFIRM
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default WithdrawModal;
