import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AppProviders } from './app/AppProviders.tsx';

createRoot(document.getElementById('root')!).render(
    <AppProviders>
      <App />
    </AppProviders>
)
