import express from 'express';
import cors from 'cors';

import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// ---------------------------------------------------------------------------
// Auth (public)
// ---------------------------------------------------------------------------
import * as authCtrl from '../controllers/authController.js';
router.post('/auth/register', authCtrl.register);
router.post('/auth/login', authCtrl.login);
router.get('/auth/me', authenticate, authCtrl.me);

// ---------------------------------------------------------------------------
// Students — admin only
// ---------------------------------------------------------------------------
import * as studentCtrl from '../controllers/studentController.js';
router.get('/students', authenticate, authorize('admin'), studentCtrl.listStudents);
router.post('/students', authenticate, authorize('admin'), studentCtrl.createStudent);
router.put('/students/:id', authenticate, authorize('admin'), studentCtrl.updateStudent);
router.delete('/students/:id', authenticate, authorize('admin'), studentCtrl.deleteStudent);
router.patch('/students/:id/eligibility', authenticate, authorize('admin'), studentCtrl.toggleEligibility);
router.post('/students/:id/reset-password', authenticate, authorize('admin'), studentCtrl.resetPassword);
router.post('/students/:id/import', authenticate, authorize('admin'), studentCtrl.importStudents);
router.get('/students/:id', authenticate, authorize('admin'), studentCtrl.getStudent);

// ---------------------------------------------------------------------------
// Elections — admin only
// ---------------------------------------------------------------------------
import * as electionCtrl from '../controllers/electionController.js';
router.get('/elections', authenticate, electionCtrl.listElections);
router.post('/elections', authenticate, authorize('admin'), electionCtrl.createElection);
router.put('/elections/:id', authenticate, authorize('admin'), electionCtrl.updateElection);
router.patch('/elections/:id/status', authenticate, authorize('admin'), electionCtrl.changeStatus);
router.post('/elections/:id/start', authenticate, authorize('admin'), electionCtrl.startElection);
router.post('/elections/:id/pause', authenticate, authorize('admin'), electionCtrl.pauseElection);
router.post('/elections/:id/close', authenticate, authorize('admin'), electionCtrl.closeElection);
router.post('/elections/:id/publish-results', authenticate, authorize('admin'), electionCtrl.publishResults);
router.get('/elections/:id', authenticate, authorize('admin'), electionCtrl.getElection);
router.post('/elections/:id/assign-voters', authenticate, authorize('admin'), electionCtrl.assignVotersToElection);

// ---------------------------------------------------------------------------
// Positions — read (any authenticated user); write — admin only
// ---------------------------------------------------------------------------
import * as positionCtrl from '../controllers/positionController.js';
router.get('/positions', authenticate, positionCtrl.listPositions);
router.post('/positions', authenticate, authorize('admin'), positionCtrl.createPosition);
router.put('/positions/:id', authenticate, authorize('admin'), positionCtrl.updatePosition);
router.delete('/positions/:id', authenticate, authorize('admin'), positionCtrl.deletePosition);

// ---------------------------------------------------------------------------
// Candidates — read (any authenticated user); write — admin only
// ---------------------------------------------------------------------------
import * as candidateCtrl from '../controllers/candidateController.js';
router.get('/candidates', authenticate, candidateCtrl.listCandidates);
router.post('/candidates', authenticate, authorize('admin'), candidateCtrl.createCandidate);

// Student self-apply (authenticated students only)
router.put('/candidates/:id', authenticate, authorize('admin'), candidateCtrl.updateCandidate);
router.delete('/candidates/:id', authenticate, authorize('admin'), candidateCtrl.removeCandidate);
router.patch('/candidates/:id/approve', authenticate, authorize('admin'), candidateCtrl.approveCandidate);
router.patch('/candidates/:id/reject', authenticate, authorize('admin'), candidateCtrl.rejectCandidate);
router.post('/candidates/:id/assign-election', authenticate, authorize('admin'), candidateCtrl.assignToElection);
router.post('/candidates/:id/assign-position', authenticate, authorize('admin'), candidateCtrl.assignToPosition);

// ---------------------------------------------------------------------------
// Votes — authenticated (students vote; admin sees aggregate stats)
// ---------------------------------------------------------------------------
import * as voteCtrl from '../controllers/voteController.js';
router.post('/votes/cast', authenticate, voteCtrl.castVote);
router.get('/votes/my-votes', authenticate, voteCtrl.myVotes);
router.get('/votes/stats/:election_id', authenticate, voteCtrl.electionStats);

// ---------------------------------------------------------------------------
// Audit log — admin only
// ---------------------------------------------------------------------------
import * as auditCtrl from '../controllers/auditController.js';
router.get('/audit', authenticate, authorize('admin'), auditCtrl.listAudit);

export default router;
