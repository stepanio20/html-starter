import { THEME, TonConnectUIProvider } from '@tonconnect/ui-react'
import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { ErrorProvider, useError } from './app/errorContext.tsx'
import Router from './app/Router.tsx'
import './index.css'
import { useTelegram } from './shared/hooks/useTelegram.tsx'
import SnackBarError from './shared/ui/Snackbar/SnackBarError.tsx'
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
  const {tg} = useTelegram()
  useEffect(() => {
    if (tg && tg.requestFullscreen) {
      tg?.disableVerticalSwipes()
      tg.requestFullscreen();
    }
  },[])
  return (
    <>
      <Router />
      <SnackBarError
        open={error !== ""}
        message={error}
        onClose={() => setError("")}
      />
    </>
  );
}