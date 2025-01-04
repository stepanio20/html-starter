import React, { useEffect, useState } from 'react'
import close from '../../../assets/close.svg'
import danger from '../../../assets/danger.svg'
import styles from './style.module.css'

interface SnackBarErrorProps {
    open: boolean;
    message: string;
    autoHideDuration?: number;
    onClose: () => void;
}

const SnackBarError: React.FC<SnackBarErrorProps> = ({ open, message, autoHideDuration = 3000, onClose }) => {
    const [visible, setVisible] = useState<boolean>(false);
    const [currentMessage, setCurrentMessage] = useState<string>('');
    const [shouldRender, setShouldRender] = useState<boolean>(false);

    useEffect(() => {
        let hideTimer: ReturnType<typeof setTimeout>;

        if (open) {
            setCurrentMessage(message);
            setShouldRender(true);
            setVisible(true);

            hideTimer = setTimeout(() => {
                setVisible(false);
            }, autoHideDuration);
        } else if (visible) {
            setVisible(false);
        }

        return () => {
            clearTimeout(hideTimer);
        };
    }, [open, message, autoHideDuration]);

    useEffect(() => {
        let removeTimer: ReturnType<typeof setTimeout>;

        if (!visible && shouldRender) {
            removeTimer = setTimeout(() => {
                setShouldRender(false);
                onClose();
            }, 300);
        }

        return () => {
            clearTimeout(removeTimer);
        };
    }, [visible, shouldRender, onClose]);

    const handleClose = () => {
        setVisible(false);
    };

    if (!shouldRender) return null;

    return (
        <div
            className={`${styles.snackBarError} ${visible ? styles.show : styles.hide}`}
        >
            <div className={styles.leftSide}>
                <img src={danger} alt="error icon" />
                <p className={styles.textError}>{currentMessage}</p>
            </div>
            <img
                src={close}
                alt="close button"
                className={styles.buttonClose}
                onClick={handleClose}
            />
        </div>
    );
};

export default SnackBarError;
