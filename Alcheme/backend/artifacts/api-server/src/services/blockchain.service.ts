/**
 * 区块链服务层
 * 封装与 AlchemeSBT 智能合约的所有交互
 *
 * 合约函数：
 *   mint(address to, string uri)  → onlyOwner，后端签名
 *   evolve(uint256 tokenId, string newUri) → 需 tokenCreator 签名，前端调用
 *   canEvolve(uint256 tokenId, address account) → view
 *   getEvolutionCount(uint256 tokenId) → view
 *   totalMinted() → view
 */
import { ethers } from "ethers";

// ─── 合约 ABI（仅声明用到的函数）────────────────────────────────────────────

const ABI = [
  "function mint(address to, string memory uri) external returns (uint256)",
  "function evolve(uint256 tokenId, string memory newUri) external",
  "function canEvolve(uint256 tokenId, address account) external view returns (bool)",
  "function getEvolutionCount(uint256 tokenId) external view returns (uint256)",
  "function totalMinted() external view returns (uint256)",
  "function tokenURI(uint256 tokenId) external view returns (string)",
  "event SoulMinted(address indexed creator, uint256 indexed tokenId, string tokenURI)",
  "event SoulEvolved(address indexed creator, uint256 indexed tokenId, string newTokenURI)",
];

// ─── 单例：provider / signer / contract ─────────────────────────────────────

let _provider: ethers.JsonRpcProvider | null = null;
let _signer: ethers.Wallet | null = null;
let _contract: ethers.Contract | null = null;

function getEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`环境变量 ${key} 未配置`);
  return val;
}

/** 获取只读 provider（用于查询操作） */
function getProvider(): ethers.JsonRpcProvider {
  if (!_provider) {
    _provider = new ethers.JsonRpcProvider(getEnv("RPC_URL"));
  }
  return _provider;
}

/** 获取可签名 contract（用于写操作：mint） */
function getContract(): ethers.Contract {
  if (!_contract) {
    const provider = getProvider();
    _signer = new ethers.Wallet(getEnv("OWNER_PRIVATE_KEY"), provider);
    _contract = new ethers.Contract(getEnv("CONTRACT_ADDRESS"), ABI, _signer);
  }
  return _contract;
}

/** 获取只读 contract（用于读操作：view functions） */
function getReadContract(): ethers.Contract {
  return new ethers.Contract(getEnv("CONTRACT_ADDRESS"), ABI, getProvider());
}

// ─── 写操作（后端作为 Owner 签名）────────────────────────────────────────────

export interface MintResult {
  onChainTokenId: string;
  txHash: string;
}

/**
 * 调用 mint(address to, string uri)
 * 后端以 Owner 身份签名，将 SBT 铸造到用户钱包地址
 * uri 必须是 ipfs://Qm... 格式的 IPFS metadata URL
 */
export async function mintSBT(
  walletAddress: string,
  metadataUri: string,
): Promise<MintResult> {
  if (!ethers.isAddress(walletAddress)) {
    throw new Error(`无效的钱包地址: ${walletAddress}`);
  }

  const contract = getContract();
  const tx = await contract.mint(walletAddress, metadataUri);
  const receipt = await tx.wait();

  // 从事件日志中提取 tokenId
  const iface = new ethers.Interface(ABI);
  let onChainTokenId = "0";

  for (const log of receipt.logs ?? []) {
    try {
      const parsed = iface.parseLog(log);
      if (parsed?.name === "SoulMinted") {
        onChainTokenId = parsed.args.tokenId.toString();
        break;
      }
    } catch {
      // 跳过无法解析的日志
    }
  }

  return { onChainTokenId, txHash: receipt.hash };
}

// ─── 读操作（查询合约状态）───────────────────────────────────────────────────

export interface TokenInfo {
  onChainTokenId: string;
  metadataUri: string;
  evolutionCount: string;
  canEvolveWith: (address: string) => Promise<boolean>;
}

export async function getTokenInfo(onChainTokenId: string): Promise<{
  metadataUri: string;
  evolutionCount: string;
}> {
  const contract = getReadContract();
  const [uri, evolutionCount] = await Promise.all([
    contract.tokenURI(onChainTokenId),
    contract.getEvolutionCount(onChainTokenId),
  ]);
  return {
    metadataUri: uri as string,
    evolutionCount: (evolutionCount as bigint).toString(),
  };
}

export async function checkCanEvolve(
  onChainTokenId: string,
  walletAddress: string,
): Promise<boolean> {
  if (!ethers.isAddress(walletAddress)) return false;
  const contract = getReadContract();
  return contract.canEvolve(onChainTokenId, walletAddress) as Promise<boolean>;
}

export async function getTotalMinted(): Promise<string> {
  const contract = getReadContract();
  const total = await contract.totalMinted();
  return (total as bigint).toString();
}

// ─── 工具函数 ─────────────────────────────────────────────────────────────────

/** 检查区块链配置是否完整 */
export function isBlockchainConfigured(): boolean {
  return !!(
    process.env["RPC_URL"] &&
    process.env["OWNER_PRIVATE_KEY"] &&
    process.env["CONTRACT_ADDRESS"]
  );
}
