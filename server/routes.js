import express from 'express'
import { userCreateController, userListController } from './controllers.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/client/index.html');
});

router.get('/users', userListController);
router.post('/users', userCreateController);

export default router;