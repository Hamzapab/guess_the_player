import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './i18n.ts';
import i18n from "./i18n";
import './index.css'
import App from './App.tsx'

import { ClerkProvider } from '@clerk/clerk-react'
import { frFR } from '@clerk/localizations'
import { arSA } from '@clerk/localizations' 
import { enUS } from '@clerk/localizations' 


const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

const localizationMap = {
  'en': enUS,
  'fr': frFR,
  'ar': arSA,
};


const currentLocale = 
localizationMap[i18n.language as keyof typeof localizationMap] || enUS;

console.log(i18n.language)
console.log(currentLocale)



createRoot(document.getElementById('root')!).render(
  
  <StrictMode>
    <ClerkProvider 
      localization={currentLocale}
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl={"/auth"}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ClerkProvider>
  </StrictMode>,
)
