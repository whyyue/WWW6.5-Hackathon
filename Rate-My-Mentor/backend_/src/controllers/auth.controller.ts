import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { successResponse, errorResponse } from '../utils/response.util';
import { z } from 'zod';
import { emailSchema, otpSchema } from '../utils/validator.util';

// 发送OTP请求参数校验
const sendOTPSchema = z.object({
  body: z.object({
    email: emailSchema,
  }),
});

// 验证OTP请求参数校验
const verifyOTPSchema = z.object({
  body: z.object({
    email: emailSchema,
    otpCode: otpSchema,
  }),
});

// OCR识别Offer请求参数校验
const ocrOfferSchema = z.object({
  body: z.object({
    base64Image: z.string().min(1, '图片不能为空'),
  }),
});

export class AuthController {
  // 发送OTP验证码接口
  static async sendOTP(req: Request, res: Response) {
    try {
      const { email } = req.body;
      await AuthService.sendOTP(email);
      res.json(successResponse(null, '验证码已发送，请注意查收'));
    } catch (error: any) {
      console.error('发送验证码失败：', error);
      res.status(500).json(errorResponse('验证码发送失败，请稍后重试'));
    }
  }

  // 验证OTP验证码接口
  static async verifyOTP(req: Request, res: Response) {
    try {
      const { email, otpCode } = req.body;
      const isValid = await AuthService.verifyOTP(email, otpCode);

      if (!isValid) {
        return res.status(400).json(errorResponse('验证码错误或已过期', 'OTP_INVALID'));
      }

      res.json(successResponse({ isVerified: true }, '邮箱验证成功'));
    } catch (error: any) {
      console.error('验证验证码失败：', error);
      res.status(500).json(errorResponse('验证失败，请稍后重试'));
    }
  }

  // OCR识别Offer Letter接口
  static async ocrOfferLetter(req: Request, res: Response) {
    try {
      const { base64Image } = req.body;
      const result = await AuthService.extractOfferInfo(base64Image);
      res.json(successResponse(result, 'Offer识别成功'));
    } catch (error: any) {
      console.error('Offer识别失败：', error);
      res.status(500).json(errorResponse('Offer识别失败，请稍后重试'));
    }
  }
}