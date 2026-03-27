// 简单的 Mock IPFS - 用于演示
// 实际部署时可替换为真实 IPFS 服务

let counter = 0;

const generateMockHash = (content) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `Qm mock ${timestamp} ${random} ${counter++}`;
};

export const uploadToIPFS = async (content) => {
  // 模拟上传延迟
  await new Promise(resolve => setTimeout(resolve, 500));

  const contentString = typeof content === 'object'
    ? JSON.stringify(content)
    : content;

  console.log('Mock IPFS upload:', contentString.substring(0, 100));
  return generateMockHash(contentString);
};

export const uploadFileToIPFS = async (file) => {
  // 模拟上传延迟
  await new Promise(resolve => setTimeout(resolve, 500));

  console.log('Mock IPFS file upload:', file.name);
  return generateMockHash(file.name);
};

export const getFromIPFS = async (hash) => {
  // Mock 返回空数据，实际应从 IPFS 获取
  console.log('Mock IPFS get:', hash);
  return null;
};

export const getIPFSUrl = (hash) => {
  // Mock 模式下返回占位图片
  return `https://picsum.photos/seed/${hash}/400/300`;
};
