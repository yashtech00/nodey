import express from 'express';
import { createNode, getAllNodes, updateNodeById, deleteNodeById, getNodeById } from '../controllers/nodeController.js';

const router = express.Router();

router.post('/create-node', createNode);
router.get('/get-node/:id', getNodeById);
router.put('/update-node/:id', updateNodeById);
router.delete('/delete-node-by-id/:id', deleteNodeById);
router.get('/get-all-nodes', getAllNodes);

export default router;