import { AppProps } from 'next/app'
import 'src/app//globals.css' // Include your other global styles if necessary
import { Analytics } from '@vercel/analytics/react'

type CustomProps = {}

function App({ Component, pageProps }: AppProps<CustomProps>) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics mode={'production'} />
    </>
  )
}

export default App
