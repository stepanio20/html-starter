import { THEME, TonConnectUIProvider } from '@tonconnect/ui-react'
import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { ErrorProvider, useError } from './app/errorContext.tsx'
import Router from './app/Router.tsx'
import RotatePhone from './features/RotatePhone/index.tsx'
import './index.css'
import { useTelegram } from './shared/hooks/useTelegram.tsx'
import SnackBarError from './shared/ui/Snackbar/SnackBarError.tsx'
import store from './store/index.ts'
import styles from './style.module.scss'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TonConnectUIProvider
      manifestUrl={`https://tgmochispa.devmainops.store/tonconnect-manifest.json`}
      uiPreferences={{ theme: THEME.DARK }}>
      <Provider store={store}>
        <ErrorProvider>
          <AppContent/>
        </ErrorProvider>
      </Provider>
    </TonConnectUIProvider>
  </StrictMode>,
)
function AppContent() {
  const { error, setError } = useError();
  const {tg, telegramId} = useTelegram()
  const [isLandscape, setIsLandscape] = useState<boolean>(true);
  let viewportHeight = window.innerHeight
  const haveHeader = true;
  const activeTab = null;


  const checkOrientation = () => {
    setIsLandscape(window.innerWidth > window.innerHeight);
  };
  useEffect(() => {
    if (telegramId) {
      tg?.disableVerticalSwipes()
      tg.requestFullscreen();
    }
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  },[])
  return (
    <>
     <div className={styles.overlay}>
        <div
          className={styles.container}
          style={{
            maxHeight: viewportHeight - (haveHeader ? 0 : 100),
            minHeight: viewportHeight - (haveHeader ? 0 : 100),
            height: `calc(100% - ${haveHeader ? 0 : 100}px)`,
            overflowY:
              activeTab === 'TAP' || activeTab === 'PROFILE'
                ? 'hidden'
                : 'auto',
          }}
        >
          {!isLandscape && (
            <RotatePhone/>
          )}
          <Router />
          <SnackBarError
            open={error !== ""}
            message={error}
            onClose={() => setError("")}
          />
      </div>
    </div>
    </>
  );
}