import { useParams } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useExhibition, useSubmissions } from '../hooks/useContract';
import { getIPFSUrl } from '../services/ipfs';
import SubmissionList from '../components/Submission/SubmissionList';
import CreateSubmission from '../components/Submission/CreateSubmission';
import ReactMarkdown from 'react-markdown';
import { useState, useEffect } from 'react';
import { getFromIPFS } from '../services/ipfs';

export default function ExhibitionPage() {
  const { id } = useParams();
  const { isConnected } = useAccount();
  const exhibitionId = parseInt(id);
  const { data: exhibition, isLoading: exhibitionLoading } = useExhibition(exhibitionId);
  const { data: submissions, isLoading: submissionsLoading } = useSubmissions(exhibitionId);
  const [content, setContent] = useState('');
  const [contentLoading, setContentLoading] = useState(false);

  useEffect(() => {
    if (exhibition?.contentHash) {
      setContentLoading(true);
      getFromIPFS(exhibition.contentHash).then((data) => {
        setContent(data || '');
        setContentLoading(false);
      });
    }
  }, [exhibition?.contentHash]);

  if (exhibitionLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!exhibition) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <p className="text-center text-gray-500">展厅不存在</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {exhibition.coverHash && (
        <img
          src={getIPFSUrl(exhibition.coverHash)}
          alt={exhibition.title}
          className="w-full h-64 object-cover rounded-xl mb-8"
        />
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {exhibition.title}
        </h1>
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <span>策展人: {exhibition.curator?.slice(0, 6)}...{exhibition.curator?.slice(-4)}</span>
          <span>投稿数: {exhibition.submissionCount}</span>
          <span>创建于: {new Date(Number(exhibition.createdAt) * 1000).toLocaleDateString()}</span>
        </div>

        {contentLoading ? (
          <div className="animate-pulse h-24 bg-gray-100 rounded-lg"></div>
        ) : (
          <div className="prose max-w-none mb-8">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </div>

      <div className="border-t pt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">投稿作品</h2>
          {isConnected && (
            <CreateSubmission exhibitionId={exhibitionId} />
          )}
        </div>

        <SubmissionList
          submissions={submissions}
          exhibitionId={exhibitionId}
          isLoading={submissionsLoading}
        />
      </div>
    </div>
  );
}
