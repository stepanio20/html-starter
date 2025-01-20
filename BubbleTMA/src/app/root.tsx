import { init } from '@telegram-apps/sdk'
import { THEME, TonConnectUIProvider, useTonAddress } from '@tonconnect/ui-react'
import { useEffect, useState } from 'react'
import { Provider, useDispatch } from 'react-redux'
import RotatePhone from '../features/RotatePhone'
import useGetAddressApi from '../shared/api/get-adress'
import useGetDemoCoinApi from '../shared/api/get-demoCoin'
import useGetInfoApi from '../shared/api/get-info'
import { TonClientProvider } from '../shared/context/ton-client-context'
import { useTelegram } from '../shared/hooks/useTelegram'
import SnackBarError from '../shared/ui/Snackbar/SnackBarError'
import { setUserId } from '../slices/UserSlide'
import store from '../store'
import { ErrorProvider, useError } from './errorContext'
import Router from './Router'


export default function Root() {
	return (
		<TonConnectUIProvider
			manifestUrl={`https://client.camelracing.io/tonconnect-manifest.json`}
			uiPreferences={{ theme: THEME.DARK }}>
				<TonClientProvider>
					<Provider store={store}>
						<ErrorProvider>
							<AppContent/>
						</ErrorProvider>
					</Provider>
			</TonClientProvider>
		</TonConnectUIProvider>
	)
}

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
      init()
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
  
      const waitForAddress = async () => {
        while (!userFriendlyAddress) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
        return userFriendlyAddress;
      };
  
      try {
        const address = userFriendlyAddress || (await waitForAddress());
  
        if (telegramId || address) {
          const response = await fetch('https://apiv2.camelracing.io/api/auth/sign-in', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              WalletAddress: address,
              TelegramId: telegramId,
            }),
          });
  
          const data = await response.json();
          dispatch(setUserId(data));
  
          await Promise.all([getInfo(data), getAddress(), getDemoCoin(data)]);
        } else if (!uuId) {
          uuId = generateUUID();
          localStorage.setItem('userId', uuId);
        } else {
          getDemoWithoutAuth(uuId);
        }
      } catch (error) {
        console.error(error);
      }
    };
  
    authenticateUser();
  }, [telegramId, userFriendlyAddress]);


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