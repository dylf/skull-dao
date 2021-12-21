import sdk from './1-initialize-sdk';
import { readFileSync } from 'fs';

const bundleDrop = sdk.getBundleDropModule(process.env.BUNDLE_DROP_ADDRESS);

(async () => {
  try {
    await bundleDrop.createBatch([
      {
        name: 'Skull Card',
        description: 'This NFT will give you access to SkullDAO',
        image: readFileSync('scripts/assets/card.png'),
      },
    ]);
    console.log('Successfully created a new NFT in the drop!');
  } catch (err) {
    console.error('failed to create the new NFT', err);
  }
})();
