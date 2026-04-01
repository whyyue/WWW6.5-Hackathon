import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateMiddleware } from '../middlewares/validate.middleware';
import { z } from 'zod';
import { emailSchema, otpSchema } from '../utils/validator.util';

const authRouter = Router();

// 发送OTP验证码
authRouter.post(
  '/send-otp',
  validateMiddleware(z.object({ body: z.object({ email: emailSchema }) })),
  AuthController.sendOTP
);

// 验证OTP验证码
authRouter.post(
  '/verify-otp',
  validateMiddleware(z.object({ body: z.object({ email: emailSchema, otpCode: otpSchema }) })),
  AuthController.verifyOTP
);

// OCR识别Offer Letter
authRouter.post(
  '/ocr-offer',
  AuthController.ocrOfferLetter
);

export default authRouter;