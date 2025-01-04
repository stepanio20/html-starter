import { SendTransactionRequest, useTonConnectUI } from '@tonconnect/ui-react'
import { useState } from "react"
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import styles from "./style.module.css"

const DepositModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState<string | number>('');
  const [tonConnectUI] = useTonConnectUI();
  const balance = useSelector((state: RootState) => state?.players?.balance);
  const address = useSelector((state: RootState) => state?.players?.depositAddress);
  
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
      } else {
        console.error("sendTransaction function not found");
      }
    } catch (error) {
      console.error("Error sending transaction:", error);
    }
  };

  const isAmountValid = () => {
    const numericAmount = parseFloat(amount as string);
    return !isNaN(numericAmount) && numericAmount > 0 && numericAmount <= balance;
  };

  return (
    <>
      <button 
        onClick={toggleModal}
        style={{ width: '120px' }}>
        Deposit
      </button>

      <div className={`${styles.modalOverlay} ${isOpen ? styles.active : ""}`}>
        <div className={styles.modalContent}>
          <button className={styles.modalClose} onClick={toggleModal}>
            &times;
          </button>
          <h2>Deposit</h2>
          <p>balance {balance}</p>
          <div className={styles.fill}>
            <div>
              <input 
                type="text" 
                placeholder='Amount'
                onChange={handleAmountChange}
                value={amount}
                style={{ marginTop: '10px' }} 
              />
            </div>
            <button
              onClick={() => sendPaymentRequest()}
              disabled={!isAmountValid()}
              className={styles.confirm}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DepositModal;
