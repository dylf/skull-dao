import { useWeb3 } from '@3rdweb/hooks';
import { ThirdwebSDK } from '@3rdweb/sdk';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { IoSkullOutline } from 'react-icons/io5';
import MintButton from '@components/MintButton';
import ConnectWallet from '@components/ConnectWallet';
import Link from 'next/link';

const sdk = new ThirdwebSDK('rinkeby');
const bundleDropModule = sdk.getBundleDropModule(
  '0x57410A9912D2e8b22cbCDb2699C1647555A2A82D',
);

const Home: NextPage = () => {
  const { address, error, provider } = useWeb3();

  const signer = provider ? provider.getSigner() : undefined;

  const [hasClaimedNft, setHasClaimedNft] = useState(false);

  useEffect(() => {
    sdk.setProviderOrSigner(signer);
  }, [signer]);

  useEffect(() => {
    if (!address) {
      return;
    }

    bundleDropModule
      .balanceOf(address, '0')
      .then((balance) => setHasClaimedNft(balance.gt(0)))
      .catch((err) => {
        setHasClaimedNft(false);
        console.error('failed to find nft balance', err);
      });
  }, [address]);

  return (
    <div className="flex flex-col bg-black min-h-screen justify-center overflow-hidden items-center">
      <Head>
        <title>SkullDao</title>
        <meta name="description" content="SkullDao" />
      </Head>
      <h1 className="text-5xl inline-flex">
        Welcome to SkullDAO
        <IoSkullOutline className="ml-5" />
      </h1>
      {error && error.name === 'UnsupportedChainIdError' && (
        <div className="mt-20 bg-red-500 w-3/4 rounded-lg text-xl text-center">
          Unsupported network please connect to Rinkeby!
        </div>
      )}
      {!error && !address && <ConnectWallet />}
      {!error && address && !hasClaimedNft && (
        <MintButton
          setHasClaimedNft={setHasClaimedNft}
          bundleDropModule={bundleDropModule}
        />
      )}
      {!error && hasClaimedNft && (
        <Link href="/dashboard">
          <a className="button">Go to dashboard</a>
        </Link>
      )}
    </div>
  );
};

export default Home;
