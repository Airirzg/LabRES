import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { AuthProvider } from '@/context/AuthContext';
import { useEffect } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '@/styles/globals.scss';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Initialize Bootstrap JavaScript
    require('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  return (
    <Provider store={store}>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </Provider>
  );
}
