import { useState } from 'react';
import ButtonLoader from './ButtonLoader';

function MintButton({ setHasClaimedNft, bundleDropModule }) {
  const [isClaiming, setIsClaiming] = useState(false);

  const mintNft = () => {
    setIsClaiming(true);

    bundleDropModule
      .claim('0', 1)
      .catch((err) => {
        console.error('failed to claim', err);
      })
      .finally(() => {
        setIsClaiming(false);
        setHasClaimedNft(true);
        console.log(
          `🌊 Successfully Minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${bundleDropModule.address}/0`,
        );
      });
  };

  return (
    <button
      disabled={isClaiming}
      className="button inline-flex"
      onClick={mintNft}
    >
      Mint your membership NFT!
      {isClaiming && <ButtonLoader />}
    </button>
  );
}

export default MintButton;
