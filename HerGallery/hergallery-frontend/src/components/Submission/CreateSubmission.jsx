import { useState } from 'react';
import { useWaitForTransactionReceipt } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { useSubmitToExhibition, useSubmissions } from '../../hooks/useContract';
import { uploadToIPFS, uploadFileToIPFS } from '../../services/ipfs';

const contentTypes = [
  { value: 'art', label: '二创' },
  { value: 'testimony', label: '证言' },
  { value: 'screenshot', label: '截图' },
  { value: 'link', label: '链接' },
];

export default function CreateSubmission({ exhibitionId }) {
  const { writeAsync: submit, data: hash } = useSubmitToExhibition();
  const queryClient = useQueryClient();
  const [contentType, setContentType] = useState('art');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [textContent, setTextContent] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [url, setUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setFilePreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) return;

    setUploading(true);
    try {
      let contentData;

      switch (contentType) {
        case 'art':
          if (file) {
            const imageHash = await uploadFileToIPFS(file);
            contentData = { type: 'art', imageHash, text: textContent };
          } else {
            contentData = { type: 'art', text: textContent };
          }
          break;
        case 'testimony':
          contentData = { type: 'testimony', text: textContent };
          break;
        case 'screenshot':
          if (file) {
            const imageHash = await uploadFileToIPFS(file);
            contentData = { type: 'screenshot', imageHash };
          }
          break;
        case 'link':
          contentData = { type: 'link', url };
          break;
        default:
          return;
      }

      const contentHash = await uploadToIPFS(contentData);

      await submit({
        exhibitionId,
        contentType,
        contentHash,
        title,
        description,
      });
    } catch (error) {
      console.error('提交失败:', error);
      setUploading(false);
    }
  };

  if (isSuccess) {
    queryClient.refetchQueries({ queryKey: ['contracts', 'read'] });
    setShowForm(false);
    setTitle('');
    setDescription('');
    setTextContent('');
    setFile(null);
    setFilePreview('');
    setUrl('');
    setUploading(false);
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
      >
        我要投稿
      </button>
    );
  }

  return (
    <div className="bg-white rounded-xl border p-4 mb-6">
      <h3 className="font-bold text-lg mb-4">提交投稿</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            类型
          </label>
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            {contentTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            标题
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={50}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            说明
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={200}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        {(contentType === 'art' || contentType === 'testimony') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {contentType === 'art' ? '创作说明/描述' : '证言内容'}
            </label>
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder={contentType === 'art' ? '描述你的创作...' : '写下你的证言...'}
            />
          </div>
        )}

        {contentType === 'art' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              上传图片
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full"
            />
            {filePreview && (
              <img
                src={filePreview}
                alt="预览"
                className="mt-2 w-full h-32 object-cover rounded"
              />
            )}
          </div>
        )}

        {contentType === 'screenshot' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              上传截图
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full"
              required
            />
            {filePreview && (
              <img
                src={filePreview}
                alt="预览"
                className="mt-2 w-full h-32 object-cover rounded"
              />
            )}
          </div>
        )}

        {contentType === 'link' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              链接URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="https://..."
              required
            />
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={confirming || uploading}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {uploading ? '上传中...' : confirming ? '确认中...' : '提交'}
          </button>
        </div>
      </form>
    </div>
  );
}
