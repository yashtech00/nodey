import asyncHandler from "../middlewares/asyncHandler.js";
import type { Request, Response } from "express";
import Node from "../models/Node.js";

const createNode = asyncHandler(async (req: Request, res: Response) => {
    const { content, parentId, order, isCompleted } = req.body;

    // Remove parentId from the mandatory check
    if(content === undefined || order === undefined) {
        return res.status(400).json({ message: "Content and Order are required" });
    }

    const node = await Node.create({
        content,
        parent_id: parentId || null, // Ensure it's null if not provided
        order,
        isCompleted: isCompleted || false,
        userId: req.user?.id
    });

    res.status(201).json(node);
});

const getAllNodes = asyncHandler(async (req: Request, res: Response) => {
    const nodes = await Node.find({ userId: req.user?.id })
        .select('content parent_id order isCompleted createdAt updatedAt')
        .lean();
    res.status(200).json(nodes);
});
const updateNodeById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { content, parentId, order, isCompleted } = req.body;
    const node = await Node.findOneAndUpdate(
        { _id: id, userId: req.user?.id },
        { content, parent_id: parentId, order, isCompleted },
        { new: true, runValidators: true }
    ).select('content parent_id order isCompleted createdAt updatedAt').lean();
    if(!node) {
        return res.status(404).json({ message: "Node not found" });
    }
    res.status(200).json(node);
});

const deleteNodeById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    // Recursive function to find all descendant IDs
    const findAllDescendants = async (parentId: string): Promise<string[]> => {
        const children = await Node.find({ parent_id: parentId, userId: req.user?.id })
            .select('_id')
            .lean();
        
        const descendantIds: string[] = [];
        for (const child of children) {
            descendantIds.push(child._id.toString());
            // Recursively find children of this child
            const grandChildren = await findAllDescendants(child._id.toString());
            descendantIds.push(...grandChildren);
        }
        return descendantIds;
    };
    
    // Find all descendants to delete
    const descendantIds = await findAllDescendants(id as string);
    
    // Delete all descendants
    if (descendantIds.length > 0) {
        await Node.deleteMany({ 
            _id: { $in: descendantIds }, 
            userId: req.user?.id 
        });
    }
    
    // Delete the actual node
    const node = await Node.findOneAndDelete({ _id: id, userId: req.user?.id });
    if(!node) {
        return res.status(404).json({ message: "Node not found" });
    }
    
    res.status(200).json({ 
        message: "Node and all descendants deleted successfully",
        deletedCount: descendantIds.length + 1
    });
});

const getNodeById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const node = await Node.findOne({ _id: id, userId: req.user?.id })
        .select('content parent_id order isCompleted createdAt updatedAt')
        .lean();
    if(!node) {
        return res.status(404).json({ message: "Node not found" });
    }
    res.status(200).json(node);
});

export { createNode, getAllNodes, getNodeById, updateNodeById, deleteNodeById };