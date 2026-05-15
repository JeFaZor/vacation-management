import { Router } from 'express';
import { currentUserMiddleware } from '../middleware/current-user';
import { requireRole } from '../middleware/require-role';
import {
  approveRequest,
  createRequest,
  listAllRequests,
  listMyRequests,
  rejectRequest,
} from '../controllers/vacation-requests.controller';

const router = Router();

router.use(currentUserMiddleware);

router.post('/', requireRole('Requester'), createRequest);
router.get('/my', requireRole('Requester'), listMyRequests);
router.get('/', requireRole('Validator'), listAllRequests);
router.patch('/:id/approve', requireRole('Validator'), approveRequest);
router.patch('/:id/reject', requireRole('Validator'), rejectRequest);

export default router;
