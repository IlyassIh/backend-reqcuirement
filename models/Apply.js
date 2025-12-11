import mongoose from "mongoose";

const applySchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    offre_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Offre', required: true },
}, { timestamps: true });

const Apply = mongoose.model('Apply', applySchema);
export default Apply;