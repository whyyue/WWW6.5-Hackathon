import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useExhibitions } from '../hooks/useContract';
import ExhibitionList from '../components/Exhibition/ExhibitionList';
import CreateExhibition from '../components/Exhibition/CreateExhibition';

export default function HomePage() {
  const { isConnected } = useAccount();
  const [showCreate, setShowCreate] = useState(false);
  const { data: exhibitions, isLoading } = useExhibitions();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          HerGallery · 她的展厅
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          女性主题链上创作与策展平台，让任何人都可以发起关于女性的主题展厅，
          通过投稿二创作品和社区推荐机制，共同构建永久存证、不可篡改的女性故事档案库。
        </p>
      </div>

      <div className="flex justify-end mb-8">
        {isConnected && (
          <button
            onClick={() => setShowCreate(true)}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            发起新展厅
          </button>
        )}
      </div>

      {showCreate && (
        <CreateExhibition onClose={() => setShowCreate(false)} />
      )}

      <ExhibitionList exhibitions={exhibitions} isLoading={isLoading} />
    </div>
  );
}
