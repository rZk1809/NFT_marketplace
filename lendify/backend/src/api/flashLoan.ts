import { Router, Request, Response } from 'express';
const router = Router();
router.get('/health', (req: Request, res: Response) => {
  res.json({ success: true, service: 'Flash Loan API', message: 'Service is healthy' });
});
export default router;