/**
 * 合约 ABI 和地址配置
 * 部署网络: Avalanche Fuji (chain-43113)
 */

// === 合约地址 ===
export const INTERN_SBT_ADDRESS = "0x0F51f416471AD9678251b68948d1bEE72925822a";
export const REVIEW_CONTRACT_ADDRESS = "0x3845300491F10FC8C87694C5c8D7D62bFc12e1DC";
export const REVIEW_DAO_ADDRESS = "0x481D0fd5a05eEdc6971c165BBC2D2aB1a2Dce744";

// === InternSBT ABI ===
export const internSbtAbi = [
  {
    name: "ownerOf",
    type: "function",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    name: "isValidCredential",
    type: "function",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
] as const;

// === ReviewContract ABI ===
export const reviewContractAbi = [
  {
    name: "submitReview",
    type: "function",
    inputs: [
      { name: "_credentialId", type: "uint256" },
      { name: "_targetId", type: "bytes32" },
      { name: "_targetType", type: "string" },
      { name: "_overallScore", type: "uint8" },
      { name: "_dimScores", type: "uint8[5]" },
      { name: "_cid", type: "bytes32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    name: "updateReviewStatus",
    type: "function",
    inputs: [
      { name: "_reviewId", type: "uint256" },
      { name: "_newStatus", type: "uint8" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    name: "getReputationScore",
    type: "function",
    inputs: [{ name: "_targetId", type: "bytes32" }],
    outputs: [{ name: "", type: "uint128" }],
    stateMutability: "view",
  },
  {
    name: "reviews",
    type: "function",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [
      { name: "credentialId", type: "uint256" },
      { name: "targetId", type: "bytes32" },
      { name: "cid", type: "bytes32" },
      { name: "createdAt", type: "uint32" },
      { name: "status", type: "uint8" },
      { name: "overallScore", type: "uint8" },
      { name: "growthScore", type: "uint8" },
      { name: "clarityScore", type: "uint8" },
      { name: "communicationScore", type: "uint8" },
      { name: "workloadScore", type: "uint8" },
      { name: "respectScore", type: "uint8" },
    ],
    stateMutability: "view",
  },
  {
    name: "targetStats",
    type: "function",
    inputs: [{ name: "", type: "bytes32" }],
    outputs: [
      { name: "totalScore", type: "uint128" },
      { name: "reviewCount", type: "uint128" },
    ],
    stateMutability: "view",
  },
  {
    name: "hasReviewed",
    type: "function",
    inputs: [
      { name: "", type: "uint256" },
      { name: "", type: "bytes32" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
] as const;

// === ReviewDAO ABI ===
export const reviewDaoAbi = [] as const;
