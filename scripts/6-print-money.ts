import { ethers } from 'ethers';
import sdk from './1-initialize-sdk';

const tokenModule = sdk.getTokenModule(
  process.env.NEXT_PUBLIC_TOKEN_MODULE_ADDRESS,
);

(async () => {
  try {
    const amount = 1_000_000;
    const amountWith18Decimals = ethers.utils.parseUnits(amount.toString(), 18);

    await tokenModule.mint(amountWith18Decimals);
    const totalSupply = await tokenModule.totalSupply();

    console.log(
      `There now is ${ethers.utils.formatUnits(
        totalSupply,
        18,
      )} $SKULLS in circulation`,
    );
  } catch (err) {
    console.error('Failed to print money', err);
  }
})();
