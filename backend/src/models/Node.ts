import mongoose from "mongoose";

const NodeSchema = new mongoose.Schema({
    content: { type: String, default: "" }, // Allow empty bullets
    parent_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Node",
        default: null // REQUIRED: Root nodes have no parent
    },
    order: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    }
}, { timestamps: true });

// Add this index to make fetching children lightning fast
NodeSchema.index({ parent_id: 1, userId: 1 });

const Node = mongoose.model("Node", NodeSchema);

export default Node;
