import mongoose from "mongoose"

const contratSchema = new mongoose.Schema({
    typeContrat: { type: String, required: true, maxLength: 30 },
}, { timestamps: true })
const Contrat = mongoose.model('Contrat', contratSchema)

export default Contrat;