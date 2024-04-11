import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import dynamic from 'next/dynamic';

import { configureRootTheme } from '@yandex/ui/Theme';
import { theme } from '../client/styles/themes/mg-light';
import '../client/styles/globals.scss';
import store from '../store';

configureRootTheme({ theme });

function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
}

export default dynamic(() => Promise.resolve(App), {
  ssr: false,
});
