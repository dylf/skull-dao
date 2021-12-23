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
    await tokenModule.delegateTo(process.env.WALLET_ADDRESS);
    const amount = 420_000;
    await voteModule.propose(
      `Should the DAO mint an additional ${amount} tokens into the treasury?`,
      [
        {
          nativeTokenValue: 0,
          transactionData: tokenModule.contract.interface.encodeFunctionData(
            'mint',
            [
              voteModule.address,
              ethers.utils.parseUnits(amount.toString(), 18),
            ],
          ),
          toAddress: tokenModule.address,
        },
      ],
    );

    console.log('Successfully created proposal to mint tokens');
  } catch (err) {
    console.error('Failed to create first proposal', err);
    process.exit(1);
  }

  try {
    await tokenModule.delegateTo(process.env.WALLET_ADDRESS);
    const amount = 6_900;
    await voteModule.propose(
      `Should the DAO transfer ${amount} tokens from the treasury to ${process.env.WALLET_ADDRESS} for being awesome?`,
      [
        {
          nativeTokenValue: 0,
          transactionData: tokenModule.contract.interface.encodeFunctionData(
            'transfer',
            [
              process.env.WALLET_ADDRESS,
              ethers.utils.parseUnits(amount.toString(), 18),
            ],
          ),
          toAddress: tokenModule.address,
        },
      ],
    );
    console.log(
      'Successfully created proposal to reward ourselves from the treasury.',
    );
  } catch (err) {
    console.error('Failed to create first proposal', err);
  }
})();
