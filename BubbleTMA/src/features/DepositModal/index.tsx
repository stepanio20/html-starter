import { SendTransactionRequest, useTonConnectUI } from '@tonconnect/ui-react'
import { useState } from "react"
import { useSelector } from 'react-redux'
import close from '../../assets/close.svg'
import useGetInfoApi from '../../shared/api/get-info'
import { RootState } from '../../store'
import useWithdrawApi from '../WithdrawModal/api'
import styles from "./style.module.css"
const DepositModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState<string | number>('');
  const [tonConnectUI] = useTonConnectUI();
  const address = useSelector((state: RootState) => state?.players?.depositAddress);
  const userId = useSelector((state: RootState) => state?.players?.userId);
  const {deposit} = useWithdrawApi()
  const {getInfo} = useGetInfoApi()
  const handleDeposit = async() => {
    if (!userId) return
    await deposit(userId, Number(amount))
  }
  const toggleModal = () => {
    setIsOpen(!isOpen);
  };
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const sendPaymentRequest = async () => {
    if (Number(amount) <= 0 || !userId) return
    try {
      const transactionParams: SendTransactionRequest = {
        messages: [
          {
            address: address,
            amount: (Number(amount) * 1e9).toString(),
            payload: "", 
          },
        ],
        validUntil: Math.floor(Date.now() / 1000) + 3600,
      };

      if (tonConnectUI.sendTransaction) {
        const result = await tonConnectUI.sendTransaction(transactionParams);
        console.log("Transaction successful:", result);
        setIsOpen(false)
        await handleDeposit()
        await getInfo(userId)
      } else {
        console.error("sendTransaction function not found");
      }
    } catch (error) {
      console.error("Error sending transaction:", error);
    }
  };

  return (
    <>
      <button 
        onClick={toggleModal}
        className={styles.depositButton}>
        DEPOSIT
      </button>

      <div className={`${styles.modalOverlay} ${isOpen ? styles.active : ""}`}>
        <div className={styles.modalContent}>
          <button className={styles.modalClose} onClick={toggleModal}>
            <img src={close} alt="" style={{width: '50px', height: '50px'}} />
          </button>
          <p className={styles.title}>DEPOSIT</p>
          <div className={styles.fill}>
            <div>
              <input 
                type="number" 
                placeholder='Enter the amount'
                onChange={handleAmountChange}
                value={amount}
                style={{ marginTop: '10px' }} 
              />
            </div>
            <button
              onClick={() => sendPaymentRequest()}
              className={styles.confirmButton}
            >
              CONFIRM
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DepositModal;
