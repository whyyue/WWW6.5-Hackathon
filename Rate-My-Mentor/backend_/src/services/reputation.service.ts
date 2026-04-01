import { DimensionScore, CompanyReputation, ReviewDimension } from '../types/review.types';
import { ContractService } from './contract.service';
import { IPFSService } from './ipfs.service';

export class ReputationService {
  // 1. 获取公司的完整声誉数据（用于声誉看板，已删除导师姓名）
  static async getCompanyReputation(
    mentorCompany: string,
    viewerWalletAddress?: `0x${string}`
  ): Promise<CompanyReputation> {
    // 1. 从合约获取该公司的所有评价
    const reviews = await ContractService.getCompanyReviews(mentorCompany);
    const reviewCount = reviews.length;

    // 2. 如果没有评价，返回空数据
    if (reviewCount === 0) {
      return {
        mentorCompany,
        reviewCount: 0,
        overallAverageScore: 0,
        dimensionAverageScores: Object.values(ReviewDimension).map((dimension) => ({
          dimension,
          score: 0,
          comment: '',
        })),
        latestReviews: [],
      };
    }

    // 3. 计算综合平均分
    const totalScore = reviews.reduce((sum, review) => sum + Number(review.overallScore), 0);
    const overallAverageScore = Number((totalScore / reviewCount).toFixed(1));

    // 4. 计算每个维度的平均分（简化版）
    const dimensionAverageScores: DimensionScore[] = Object.values(ReviewDimension).map((dimension) => ({
      dimension,
      score: overallAverageScore,
      comment: '',
    }));

    // 5. 处理最新评价：只有查看者持有SBT，才返回解密后的详细内容
    const latestReviews = reviews.slice(-5).reverse(); // 取最新5条
    const hasSBT = viewerWalletAddress
      ? await ContractService.checkUserHasSBT(viewerWalletAddress)
      : false;

    // 6. 给前端返回的评价数据
    const processedReviews = await Promise.all(
      latestReviews.map(async (review) => {
        // 没有SBT，只返回公开数据
        if (!hasSBT) {
          return {
            walletAddress: review.reviewer,
            mentorCompany: review.mentorCompany,
            rawReviewContent: '持有SBT即可查看详细评价内容',
            aiResult: {
              overallScore: review.overallScore,
              dimensionScores: [],
              summary: '',
              tags: [],
              isQualified: true,
            },
            ipfsCid: review.ipfsCid,
          };
        }

        // 有SBT，解密返回详细内容
        try {
          const rawContent = await IPFSService.getDecryptedReview(review.ipfsCid);
          return {
            walletAddress: review.reviewer,
            mentorCompany: review.mentorCompany,
            rawReviewContent: rawContent,
            aiResult: {
              overallScore: review.overallScore,
              dimensionScores: [],
              summary: '',
              tags: [],
              isQualified: true,
            },
            ipfsCid: review.ipfsCid,
          };
        } catch (error) {
          return {
            walletAddress: review.reviewer,
            mentorCompany: review.mentorCompany,
            rawReviewContent: '内容获取失败',
            aiResult: {
              overallScore: review.overallScore,
              dimensionScores: [],
              summary: '',
              tags: [],
              isQualified: true,
            },
            ipfsCid: review.ipfsCid,
          };
        }
      })
    );

    // 7. 返回完整的声誉数据
    return {
      mentorCompany,
      reviewCount,
      overallAverageScore,
      dimensionAverageScores,
      latestReviews: processedReviews,
    };
  }

  // 2. 获取热门公司榜单（按评价数量和平均分排序）
  static async getHotCompanyList(limit: number = 10): Promise<CompanyReputation[]> {
    // 黑客松MVP简化版，后续可以从合约获取全量公司数据排序
    return [];
  }
}