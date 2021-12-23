import { ethers } from 'ethers';
import sdk from './1-initialize-sdk';

const voteModule = sdk.getVoteModule(
  process.env.NEXT_PUBLIC_VOTE_MODULE_ADDRESS,
);

const tokenModule = sdk.getTokenModule(
  process.env.NEXT_PUBLIC_TOKEN_MODULE_ADDRESS,
);

(async () => {
  try {
    await tokenModule.grantRole('minter', voteModule.address);

    console.log(
      'Successfully gave vote module permissions to act on token module',
    );
  } catch (err) {
    console.error(
      'Failed to grant vote module permissions on token module',
      err,
    );
  }

  try {
    const ownedTokenBalance = await tokenModule.balanceOf(
      process.env.WALLET_ADDRESS,
    );

    const ownedAmount = ethers.BigNumber.from(ownedTokenBalance.value);
    const percent90 = ownedAmount.div(100).mul(90);

    await tokenModule.transfer(voteModule.address, percent90);
    console.log('Successfully transferred tokens to vote module');
  } catch (err) {
    console.error('Failed to transfer tokens to vote module', err);
  }
})();
