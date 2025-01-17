import { createRoot } from 'react-dom/client'
import Root from './app/root.tsx'
import './index.css'
import './polyfill'
createRoot(document.getElementById('root')!).render(<Root/>)