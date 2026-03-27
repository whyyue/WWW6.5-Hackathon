import { useContractRead, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contract';

export const useExhibitions = () => {
  return useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAllExhibitions',
    query: {
      enabled: CONTRACT_ADDRESS !== '0x...',
    },
  });
};

export const useExhibition = (id) => {
  return useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getExhibition',
    args: [id],
    query: {
      enabled: id !== undefined && CONTRACT_ADDRESS !== '0x...',
    },
  });
};

export const useSubmissions = (exhibitionId) => {
  return useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getSubmissions',
    args: [exhibitionId],
    query: {
      enabled: exhibitionId !== undefined && CONTRACT_ADDRESS !== '0x...',
    },
  });
};

export const useCreateExhibition = () => {
  const { writeContract, isPending } = useWriteContract();

  const createExhibition = async ({ title, contentHash, coverHash }) => {
    const hash = await writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'createExhibition',
      args: [title, contentHash, coverHash],
      value: BigInt(1000000000000000),
    });
    return hash;
  };

  return {
    writeAsync: createExhibition,
    isPending,
  };
};

export const useSubmitToExhibition = () => {
  const { writeContract, isPending } = useWriteContract();

  const submitToExhibition = async ({ exhibitionId, contentType, contentHash, title, description }) => {
    return writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'submitToExhibition',
      args: [exhibitionId, contentType, contentHash, title, description],
    });
  };

  return {
    writeAsync: submitToExhibition,
    isPending,
  };
};

export const useRecommend = () => {
  const { writeContract, isPending } = useWriteContract();

  const recommend = async ({ exhibitionId, submissionId }) => {
    return writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'recommend',
      args: [exhibitionId, submissionId],
    });
  };

  return {
    writeAsync: recommend,
    isPending,
  };
};
