import { useState, useEffect } from 'react';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { getFromIPFS, getIPFSUrl } from '../../services/ipfs';
import { useRecommend } from '../../hooks/useContract';

const typeIcons = {
  art: '🎨',
  testimony: '💬',
  screenshot: '📸',
  link: '🔗',
};

const typeLabels = {
  art: '二创',
  testimony: '证言',
  screenshot: '截图',
  link: '链接',
};

function SubmissionCard({ submission, exhibitionId }) {
  const { address } = useAccount();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const { writeAsync: recommend, data: hash } = useRecommend();
  const queryClient = useQueryClient();

  const { isLoading: recommending } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (hash) {
      queryClient.refetchQueries({ queryKey: ['contracts', 'read'] });
    }
  }, [hash, exhibitionId, queryClient]);

  useEffect(() => {
    if (submission.contentHash) {
      getFromIPFS(submission.contentHash).then((data) => {
        setContent(data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [submission.contentHash]);

  const handleRecommend = async () => {
    try {
      await recommend({ exhibitionId, submissionId: submission.id });
    } catch (error) {
      console.error('推荐失败:', error);
    }
  };

  const renderPreview = () => {
    if (loading) {
      return <div className="animate-pulse h-20 bg-gray-100 rounded"></div>;
    }

    if (!content) return null;

    switch (content.type) {
      case 'art':
        return content.imageHash ? (
          <img
            src={getIPFSUrl(content.imageHash)}
            alt={submission.title}
            className="w-full h-32 object-cover rounded"
          />
        ) : (
          <p className="text-gray-600 line-clamp-2">{content.text}</p>
        );
      case 'testimony':
        return <p className="text-gray-600 line-clamp-2">{content.text}</p>;
      case 'screenshot':
        return content.imageHash ? (
          <img
            src={getIPFSUrl(content.imageHash)}
            alt={submission.title}
            className="w-full h-32 object-cover rounded"
          />
        ) : null;
      case 'link':
        return (
          <a
            href={content.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 hover:underline"
          >
            {content.url}
          </a>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{typeIcons[content?.type] || '📄'}</span>
          <span className="text-xs px-2 py-1 bg-gray-100 rounded">
            {typeLabels[content?.type] || submission.contentType}
          </span>
        </div>
        <button
          onClick={handleRecommend}
          disabled={recommending}
          className="text-2xl hover:scale-110 transition-transform disabled:opacity-50"
        >
          ❤️
        </button>
      </div>

      <h3 className="font-bold text-gray-900 mb-1">{submission.title}</h3>
      <p className="text-sm text-gray-500 mb-2">{submission.description}</p>

      {renderPreview()}

      <div className="flex items-center justify-between mt-4 text-xs text-gray-400">
        <span>创作者: {submission.creator?.slice(0, 6)}...{submission.creator?.slice(-4)}</span>
        <span>推荐: {submission.recommendCount}</span>
      </div>
    </div>
  );
}

export default function SubmissionList({ submissions, exhibitionId, isLoading }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse bg-white rounded-xl border p-4">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-24 bg-gray-100 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl">
        <p className="text-gray-500 mb-2">暂无投稿</p>
        <p className="text-gray-400 text-sm">成为第一个创作者</p>
      </div>
    );
  }

  const sortedSubmissions = [...submissions].sort(
    (a, b) => Number(b.recommendCount) - Number(a.recommendCount)
  );

  return (
    <div className="space-y-4">
      {sortedSubmissions.map((submission) => (
        <SubmissionCard
          key={submission.id}
          submission={submission}
          exhibitionId={exhibitionId}
        />
      ))}
    </div>
  );
}
