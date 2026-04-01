import { Request, Response } from 'express';
import { IPFSService } from '../services/ipfs.service';
import { successResponse, errorResponse } from '../utils/response.util';
import { z } from 'zod';
import { reviewContentSchema } from '../utils/validator.util';

// 上传评价请求参数校验
const uploadReviewSchema = z.object({
  body: z.object({
    rawContent: reviewContentSchema,
  }),
});

// 获取评价请求参数校验
const getReviewSchema = z.object({
  params: z.object({
    cid: z.string().min(1, 'CID不能为空'),
  }),
});

export class IPFSController {
  // 加密上传评价内容到IPFS接口
  static async uploadEncryptedReview(req: Request, res: Response) {
    try {
      const { rawContent } = req.body;
      const result = await IPFSService.uploadEncryptedReview(rawContent);
      res.json(successResponse(result, '内容上传成功'));
    } catch (error: any) {
      console.error('IPFS上传失败：', error);
      res.status(500).json(errorResponse('内容上传失败，请稍后重试'));
    }
  }

  // 从IPFS获取并解密评价内容接口
  static async getDecryptedReview(req: Request, res: Response) {
    try {
      const { cid } = req.params;
      const rawContent = await IPFSService.getDecryptedReview(cid);
      res.json(successResponse({ rawContent }, '内容获取成功'));
    } catch (error: any) {
      console.error('IPFS内容获取失败：', error);
      res.status(500).json(errorResponse('内容获取失败，请稍后重试'));
    }
  }
}