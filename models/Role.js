import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
    role: { type: String, required: true },
}, { timestamps: true });

const Role = mongoose.model('Role', roleSchema);

export default Role;