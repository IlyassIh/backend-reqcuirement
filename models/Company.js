import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
    company: { type: String, required: true, maxLength: 30 },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Company = mongoose.model('Company', companySchema);
export default Company;

