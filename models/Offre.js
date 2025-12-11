import mongoose from "mongoose";

const offreSchema = new mongoose.Schema({
    offre: { type: String, required: true, maxLength: 30 },
    description: { type: String, required: true },
    salaire: { type: Number},
    status: { type: Boolean, required: true },
    company_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    secteur_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Secteur', required: true },
    typecontrat_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Contrat', required: true },
}, { timestamps: true });

const Offre = mongoose.model('Offre', offreSchema);
export default Offre;