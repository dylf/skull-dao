import { ThirdwebProvider } from '@3rdweb/react';
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import React from 'react';
import 'regenerator-runtime/runtime';
import Head from 'next/head';

// 4 = Rinkeby.
const supportedChainIds = [4];

// Metamask = injected
const connectors = {
  injected: {},
};

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider
      connectors={connectors}
      supportedChainIds={supportedChainIds}
    >
      <Head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg"></link>
      </Head>
      <Component {...pageProps} />
    </ThirdwebProvider>
  );
}

export default MyApp;
