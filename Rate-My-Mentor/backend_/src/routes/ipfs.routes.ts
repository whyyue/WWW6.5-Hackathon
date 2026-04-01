import { Router } from 'express';
import { IPFSController } from '../controllers/ipfs.controller';
import { validateMiddleware } from '../middlewares/validate.middleware';
import { z } from 'zod';
import { reviewContentSchema } from '../utils/validator.util';

const ipfsRouter = Router();

// 加密上传评价内容
ipfsRouter.post(
  '/upload',
  validateMiddleware(z.object({ body: z.object({ rawContent: reviewContentSchema }) })),
  IPFSController.uploadEncryptedReview
);

// 获取并解密评价内容
ipfsRouter.get(
  '/review/:cid',
  IPFSController.getDecryptedReview
);

export default ipfsRouter;