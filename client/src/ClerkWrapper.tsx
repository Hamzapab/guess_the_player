
import { BrowserRouter } from 'react-router-dom'
import './i18n.ts';
import App from './App.tsx'

import { ClerkProvider } from '@clerk/clerk-react'
import { frFR , arSA , enUS} from '@clerk/localizations'
import { useTranslation } from 'react-i18next';



const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

const localizationMap = {
  'en': enUS,
  'fr': frFR,
  'ar': arSA,
};

export default function ClerkWrapper() {
  const { i18n } = useTranslation();
  const currentLocale =
    localizationMap[i18n.language as keyof typeof localizationMap] || enUS;

  return (
    <ClerkProvider
      localization={currentLocale}
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl={"/auth"}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ClerkProvider>
  );
}




