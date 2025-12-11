import mongoose, { mongo } from 'mongoose';

const userSchema = new mongoose.Schema({
    nom: { type: String, required: true, maxLength: 20 },
    prenom: { type: String, required: true, maxLength: 20 },
    email: { type: String, required: true, maxLength: 30, unique: true },
    password: { type: String, required: true, minLength: 8 },
    role_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true},
    soft_delete: {type: Boolean, default: 0}
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;