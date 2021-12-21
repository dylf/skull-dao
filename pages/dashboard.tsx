import { useWeb3 } from '@3rdweb/hooks';
import { ThirdwebSDK } from '@3rdweb/sdk';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { IoSkullOutline } from 'react-icons/io5';

const sdk = new ThirdwebSDK('rinkeby');
const bundleDropModule = sdk.getBundleDropModule(
  process.env.NEXT_PUBLIC_BUNDLE_DROP_ADDRESS,
);

const Dashboard: NextPage = () => {
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
        SkullDAO Members
        <IoSkullOutline className="ml-5" />
      </h1>
      <div className="mt-10">Congratulations on being a member!</div>
    </div>
  );
};

export default Dashboard;
