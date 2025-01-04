import { useState } from "react"
import styles from "./style.module.css"

const WithdrawModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

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
          <div className={styles.fill}>
						<div>
							<p style={{textAlign: 'left'}}>UserID</p>
							<input type="text" />
						</div>
						<div>
							<p style={{textAlign: 'left'}}>Amount</p>
							<input type="text" />
						</div>

            <button>Confirm</button>
					</div>
        </div>
      </div>
    </>
  );
};

export default WithdrawModal;
