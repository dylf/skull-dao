import sdk from './1-initialize-sdk';

const app = sdk.getAppModule(process.env.THIRDWEB_APP_ADDRESS);

(async () => {
  try {
    const tokenModule = await app.deployTokenModule({
      name: 'SkullDAO Governance Token',
      symbol: 'SKULLS',
    });
    console.log(
      'Successfully deployed token module, address:',
      tokenModule.address,
    );
  } catch (err) {
    console.error('failed to deploy token module', err);
  }
})();
