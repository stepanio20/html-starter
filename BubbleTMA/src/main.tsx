import { THEME, TonConnectUIProvider, useTonAddress } from '@tonconnect/ui-react'
import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider, useDispatch } from 'react-redux'
import { ErrorProvider, useError } from './app/errorContext.tsx'
import Router from './app/Router.tsx'
import RotatePhone from './features/RotatePhone/index.tsx'
import './index.css'
import useGetAddressApi from './shared/api/get-adress.ts'
import useGetDemoCoinApi from './shared/api/get-demoCoin.ts'
import useGetInfoApi from './shared/api/get-info.ts'
import { useTelegram } from './shared/hooks/useTelegram.tsx'
import SnackBarError from './shared/ui/Snackbar/SnackBarError.tsx'
import { setUserId } from './slices/UserSlide.ts'
import store from './store/index.ts'
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
  const [isLandscape, setIsLandscape] = useState<boolean>(window.innerWidth > window.innerHeight);

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
    const dispatch = useDispatch()
    const userFriendlyAddress = useTonAddress();
    const {getInfo} = useGetInfoApi()
    const {getAddress} = useGetAddressApi()
    const {getDemoCoin, getDemoWithoutAuth} = useGetDemoCoinApi()


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

  useEffect(() => {
    const authenticateUser = async () => {
      let uuId = localStorage.getItem('userId');
      if (telegramId || userFriendlyAddress) {
        try {
          const response = await fetch('https://lexcore.devmainops.store/api/auth/sign-in', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                WalletAddress: userFriendlyAddress,
                TelegramId: telegramId,
              }),
          });

          const data:string = await response.json();
          dispatch(setUserId(data))
          Promise.all([getInfo(data), getAddress(), getDemoCoin(data)])
        } catch (error) {
          console.error(error);
        }
      } else if (!uuId) {
          uuId = generateUUID();
          localStorage.setItem('userId', uuId);
      } else {
          getDemoWithoutAuth(uuId)
      }
    };

    authenticateUser();
  }, [userFriendlyAddress, telegramId]);


  return (
    <>
    <div id="app">
      <div style={{display: 'flex', flexDirection: 'column', maxHeight: '100vh'}}>
      <div style={{flex: 1}}>
          {!isLandscape && (
            <RotatePhone />
          )}
          <Router />
          <SnackBarError
            open={error !== ""}
            message={error}
            onClose={() => setError("")}
          />
        </div>
      </div>
    </div>
    </>
  );
}