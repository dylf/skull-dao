import sdk from './1-initialize-sdk';
import { readFileSync } from 'fs';

const app = sdk.getAppModule(process.env.THIRDWEB_APP_ADDRESS);

(async () => {
  try {
    const bundleDropModule = await app.deployBundleDropModule({
      name: 'SkullDAO Membership',
      description: 'A DAO for fans of skulls.',
      image: readFileSync('scripts/assets/3185.jpg'),
      primarySaleRecipientAddress: process.env.WALLET_ADDRESS,
    });

    console.log(
      '✅ Successfully deployed bundleDrop module, address:',
      bundleDropModule.address,
    );
    console.log(
      '✅ bundleDrop metadata:',
      await bundleDropModule.getMetadata(),
    );
  } catch (error) {
    console.log('failed to deploy bundleDrop module', error);
  }
})();
