import { invoice } from '@telegram-apps/sdk'
import { JettonMaster } from '@ton/ton'
import { SendTransactionRequest, useTonAddress, useTonConnectUI } from '@tonconnect/ui-react'
import { useEffect, useState } from "react"
import { useSelector } from 'react-redux'
import close from '../../assets/close.svg'
import useGetInfoApi from '../../shared/api/get-info'
import useInvoiceApi from '../../shared/api/get-invoice'
import useGetCoinRate from '../../shared/api/get-rate'
import { INVOICE_WALLET_ADDRESS, USDT_MASTER_ADDRESS } from '../../shared/constants/common-constants'
import { JETTON_TRANSFER_GAS_FEES } from '../../shared/constants/fees.constants'
import { calculateUsdtAmount } from '../../shared/helpers/common-helpers'
import { useGenerateId } from '../../shared/hooks/useGenerateId'
import { useTelegram } from '../../shared/hooks/useTelegram'
import { useTonConnect } from '../../shared/hooks/useTonConnect'
import { JettonWallet } from '../../shared/wrappers/JettonWallet'
import { RootState } from '../../store'
import useWithdrawApi from '../WithdrawModal/api'
import styles from "./style.module.scss"
const DepositModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState<string | number>('');
  const [tonConnectUI] = useTonConnectUI();
  const {depositAddress, userId, usdtRate} = useSelector((state: RootState) => state?.user)
  const {deposit} = useWithdrawApi()
  const {getInfo} = useGetInfoApi()
  const {getUsdtRate} = useGetCoinRate()
  const userFriendlyAddress = useTonAddress()
  const { sender, walletAddress, tonClient } = useTonConnect();
  const orderId = useGenerateId();
  const [currency, setCurrency] = useState("TON");
  const {getInvoiceAddress} = useInvoiceApi()
  const {telegramId} = useTelegram()


  const handleCurrencyChange = (newCurrency:string) => {
    setCurrency(newCurrency);
  };


  useEffect(() => {
    getUsdtRate()
  },[])

  
 const handleConnectWallet = async () => {
  try {
    await tonConnectUI.connectWallet();
    console.log("Wallet connected successfully");
  } catch (error) {
    console.error("Error connecting wallet:", error);
  }
};

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
    try {
      if (!tonClient || !walletAddress) return;

      const jettonMaster = tonClient.open(JettonMaster.create(USDT_MASTER_ADDRESS));
      const usersUsdtAddress = await jettonMaster.getWalletAddress(walletAddress);

      const jettonWallet = tonClient.open(JettonWallet.createFromAddress(usersUsdtAddress));

      await jettonWallet.sendTransfer(sender, {
        fwdAmount: 1n,
        comment: orderId,
        jettonAmount: calculateUsdtAmount(Number(amount) * 100),
        toAddress: INVOICE_WALLET_ADDRESS,
        value: JETTON_TRANSFER_GAS_FEES,
      });
      
    } catch (error) {
      console.log('Error during transaction check:', error);
    }
  };

  const sendPaymentRequestinTON = async () => {
    if (Number(amount) <= 0 || !userId || !usdtRate) return;
    try {
      const amountInTon = (Number(amount) / usdtRate) * 1e9;
      
  
      const transactionParams: SendTransactionRequest = {
        messages: [
          {
            address: depositAddress,
            amount: Math.floor(amountInTon).toString(),
            payload: "", 
          },
        ],
        validUntil: Math.floor(Date.now() / 1000) + 3600,
      };
  
      if (tonConnectUI.sendTransaction) {
        const result = await tonConnectUI.sendTransaction(transactionParams);
        console.log("Transaction successful:", result);
        setIsOpen(false);
        await handleDeposit();
        await getInfo(userId);
      } else {
        console.error("sendTransaction function not found");
      }
    } catch (error) {
      console.error("Error sending transaction:", error);
    }
  };

  const sendPaymentRequestinStars = async () => {
    const res = await getInvoiceAddress(Number(amount));
    if (res) {
      const invoiceUrl = res.replace("https://t.me/$", "");
      invoice.open(invoiceUrl)
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
          <img src={close} alt="Close" style={{ width: "50px", height: "50px" }} />
        </button>
        <p className={styles.title}>DEPOSIT</p>

        {userFriendlyAddress ? (
          <div className={styles.fill}>
            <div>
              <div
              className={styles.toggleContainer}>
                <button
                  onClick={() => handleCurrencyChange("TON")}
                  className={currency === "TON" ? styles.activeButton : styles.inactiveButton}
                >
                  Pay with TON
                </button>
                <button
                  onClick={() => handleCurrencyChange("USDT")}
                  className={currency === "USDT" ? styles.activeButton : styles.inactiveButton}
                >
                  Pay with USDT
                </button>
              </div>
              {telegramId && (
                <div
                  className={styles.toggleContainer}>
                  <button
                    onClick={() => handleCurrencyChange("XTR")}
                    className={currency === "XTR" ? styles.activeButton : styles.inactiveButton}
                  >
                    Pay with TG⭐
                  </button>
                </div>
              )}
           
              <input
                type="number"
                placeholder={`Enter the amount in ${currency}`}
                onChange={handleAmountChange}
                value={amount}
                style={{ marginTop: "10px" }}
              />
              {currency === 'TON' && (
                 <p 
                 style={{fontSize: '12px', marginTop: '5px', maxWidth: '320px', opacity: '55%', color: 'black'}}
                 >Deposits are made in TON and auto converted in USD based on current market rate, please input amount of USD to deposit (min 1$)
                 </p>
              )}
            </div>
            <button onClick={() => currency === 'TON' ? sendPaymentRequestinTON() : currency === 'USDT' ? sendPaymentRequest() : sendPaymentRequestinStars()} className={styles.confirmButton}>
              CONFIRM
            </button>
          </div>
        ) : (
          <button className={styles.confirmButton} onClick={handleConnectWallet}>
            CONNECT WALLET
          </button>
        )}
      </div>
    </div>
    </>
  );
};

export default DepositModal;
