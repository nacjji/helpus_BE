import { Router } from 'express';

const chatRouter = Router();

chatRouter.get('/send', (req, res) => res.json({ message: 'OK' }));

export default chatRouter;
