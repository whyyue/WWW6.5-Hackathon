import { useState } from 'react';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateExhibition } from '../../hooks/useContract';
import { uploadToIPFS, uploadFileToIPFS } from '../../services/ipfs';

export default function CreateExhibition({ onClose }) {
  const { isConnected } = useAccount();
  const { writeAsync: createExhibition, data: hash } = useCreateExhibition();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [uploading, setUploading] = useState(false);

  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content || !coverFile) return;
    if (!isConnected) {
      alert('请先连接钱包');
      return;
    }

    setUploading(true);
    try {
      const contentHash = await uploadToIPFS(content);
      const coverHash = await uploadFileToIPFS(coverFile);

      await createExhibition({ title, contentHash, coverHash });
    } catch (error) {
      console.error('创建展厅失败:', error);
      alert('创建失败: ' + (error.message || '未知错误'));
      setUploading(false);
    }
  };

  if (isSuccess) {
    queryClient.invalidateQueries({ queryKey: ['exhibitions'] });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">发起新展厅</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              标题
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={50}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="展厅名称，如：云吃吃事件"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              主题介绍 (Markdown)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="使用Markdown编写展厅介绍..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              封面图
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="w-full"
              required
            />
            {coverPreview && (
              <img
                src={coverPreview}
                alt="封面预览"
                className="mt-2 w-full h-48 object-cover rounded-lg"
              />
            )}
          </div>

          <div className="text-sm text-gray-500">
            需质押 0.001 AVAX 创建展厅
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={confirming || uploading}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {uploading ? '上传中...' : confirming ? '确认中...' : '确认创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
