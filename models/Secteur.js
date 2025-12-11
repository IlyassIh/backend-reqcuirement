import mongoose from "mongoose";

const secteurSchema = new mongoose.Schema({
    secteur: { type: String, required: true },
}, { timestamps: true });

const Secteur = mongoose.model('Secteur', secteurSchema);
export default Secteur;