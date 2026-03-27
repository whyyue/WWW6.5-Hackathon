import { Link } from 'react-router-dom';
import { getIPFSUrl } from '../../services/ipfs';

export default function ExhibitionList({ exhibitions, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-48 rounded-xl mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!exhibitions || exhibitions.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg mb-4">暂无展厅</p>
        <p className="text-gray-400">成为第一个策展人，发起关于女性的展厅</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {exhibitions.map((exhibition) => (
        <Link
          key={exhibition.id}
          to={`/exhibition/${exhibition.id}`}
          className="block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
        >
          {exhibition.coverHash && (
            <img
              src={getIPFSUrl(exhibition.coverHash)}
              alt={exhibition.title}
              className="w-full h-48 object-cover"
            />
          )}
          <div className="p-4">
            <h3 className="font-bold text-lg text-gray-900 mb-2">
              {exhibition.title}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>策展人: {exhibition.curator?.slice(0, 6)}...</span>
              <span>投稿: {exhibition.submissionCount}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
