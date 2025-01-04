import { useState } from "react"
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import useWithdrawApi from './api'
import styles from "./style.module.css"
import useGetInfoApi from "../../shared/api/get-info.ts";

const WithdrawModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState<string | number>("")
  const balance = useSelector((state: RootState) => state?.players?.balance);
  const userId = useSelector((state: RootState) => state?.players?.userId);
  const {withdraw} = useWithdrawApi()
  const [loading, setLoading] = useState<boolean>(false)
  const {getInfo} = useGetInfoApi()

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
    return !isNaN(numericAmount) && numericAmount > 0 && numericAmount <= balance;
  };

  const handleWithdraw = async() => {
    if (!userId) return
    setLoading(true)
    setIsOpen(false)
    await withdraw(userId, Number(amount))
    await getInfo(userId)
    setLoading(false)
  }

  return (
    <>
      <button 
			onClick={toggleModal}
      style={{width: '120px'}}>
				Withdraw
			</button>

      <div className={`${styles.modalOverlay} ${isOpen ? styles.active : ""}`}>
        <div className={styles.modalContent}>
          <button className={styles.modalClose} onClick={toggleModal}>
            &times;
          </button>
          <h2>Withdraw</h2>
          <p>balance {balance}</p>
          <div className={styles.fill}>
						<div>
							<input 
              type="number"
              placeholder='Amount'
              value={amount}
              onChange={handleAmountChange} />
						</div>
            <button
              className={styles.confirm}
              disabled={!isAmountValid() || loading}
              onClick={() => handleWithdraw()}
            >
              Confirm
            </button>
					</div>
        </div>
      </div>
    </>
  );
};

export default WithdrawModal;
