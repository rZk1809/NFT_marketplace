import { Router, Request, Response } from 'express';
const router = Router();
router.get('/health', (req: Request, res: Response) => {
  res.json({ success: true, service: 'DAO API', message: 'Service is healthy' });
});
export default router;