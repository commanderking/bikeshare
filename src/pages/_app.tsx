import { AppProps } from 'next/app';

import 'src/app//globals.css';     // Include your other global styles if necessary

type CustomProps = {}

function App({ Component, pageProps }: AppProps<CustomProps>) {
  return <Component {...pageProps} />;
}

export default App;
