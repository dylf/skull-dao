import { useWeb3 } from '@3rdweb/hooks';
import { IoWalletOutline } from 'react-icons/io5';

function ConnectWallet() {
  const { connectWallet } = useWeb3();
  return (
    <button
      onClick={() => connectWallet('injected')}
      className="button inline-flex"
    >
      Connect your wallet
      <IoWalletOutline className="w-6 h-6 ml-3" />
    </button>
  );
}

export default ConnectWallet;
