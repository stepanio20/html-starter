import { THEME, TonConnectUIProvider } from '@tonconnect/ui-react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import Router from './app/Router.tsx'
import './index.css'
import store from './store/index.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TonConnectUIProvider
      manifestUrl={`https://tgmochispa.devmainops.store/tonconnect-manifest.json`}
      uiPreferences={{ theme: THEME.DARK }}>
      <Provider store={store}>
        <Router />
      </Provider>
    </TonConnectUIProvider>
  </StrictMode>,
)
