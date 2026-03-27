import { useAccount, useConnect } from 'wagmi';
import { Link } from 'react-router-dom';

function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  if (isConnected && address) {
    return (
      <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
        {address.slice(0, 6)}...{address.slice(-4)}
      </span>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: connectors[0] })}
      className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
    >
      连接钱包
    </button>
  );
}

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-200 sticky top-0 bg-white/80 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-purple-600">
            HerGallery
          </Link>
          <WalletButton />
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t border-gray-200 py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-500 text-sm">
          HerGallery - 她的展厅 | 女性主题链上创作与策展平台
        </div>
      </footer>
    </div>
  );
}
