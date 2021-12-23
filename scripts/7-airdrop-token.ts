import { ethers } from 'ethers';
import sdk from './1-initialize-sdk';

const bundleDropModule = sdk.getBundleDropModule(
  process.env.NEXT_PUBLIC_BUNDLE_DROP_ADDRESS,
);

const tokenModules = sdk.getTokenModule(
  process.env.NEXT_PUBLIC_TOKEN_MODULE_ADDRESS,
);

(async () => {
  try {
    const walletAddresses = await bundleDropModule.getAllClaimerAddresses('0');

    if (walletAddresses.length === 0) {
      console.log(
        'No NFTs have been claimed yet, maybe get some friends to claim your free NFTs!',
      );
      process.exit(0);
    }

    const airdropTargets = walletAddresses.map((address) => {
      // Between 1000 and 10,000
      const randomAmount = Math.floor(
        Math.random() * (10000 - 1000 + 1) + 1000,
      );
      console.log(`Going to airdrop ${randomAmount} tokens to ${address}`);

      const airdropTarget = {
        address,
        amount: ethers.utils.parseUnits(randomAmount.toString(), 18),
      };

      return airdropTarget;
    });

    console.log('Starting airdrop...');
    await tokenModules.transferBatch(airdropTargets);
    console.log(
      'Successfully airdropped tokens to all the holders of the NFT!',
    );
  } catch (err) {
    console.error('Failed to airdrop tokens', err);
  }
})();
