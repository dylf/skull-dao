import sdk from './1-initialize-sdk';

const appModule = sdk.getAppModule(process.env.THIRDWEB_APP_ADDRESS);

(async () => {
  try {
    const voteModule = await appModule.deployVoteModule({
      name: 'SkullDAO Proposals',
      votingTokenAddress: process.env.NEXT_PUBLIC_TOKEN_MODULE_ADDRESS,
      proposalStartWaitTimeInSeconds: 0,
      proposalVotingTimeInSeconds: 24 * 60 * 60,
      votingQuorumFraction: 60,
      minimumNumberOfTokensNeededToPropose: '1000',
    });

    console.log(
      'Successfully deployed vote module, address:',
      voteModule.address,
    );
  } catch (err) {
    console.error('Failed to deploy vote module', err);
  }
})();
