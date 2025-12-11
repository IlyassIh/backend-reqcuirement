import Apply from "../models/Apply.js";
import Company from "../models/Company.js";
import Offre from "../models/Offre.js"

export async function allOffers(req, res) {
    try {
        const offers = await Offre.find({status: true}).populate('company_id', 'company -_id').populate('secteur_id', 'secteur -_id').populate('typecontrat_id', 'typeContrat -_id');
        if (offers.length === 0) return res.status(404).json({message: "There is no offers yet!"});

        res.status(200).json({message: "All offers: ", data : offers})
    }catch(err) {
        res.status(500).json({message: "error in all offers condida"})
    }
}

export async function viewOffre(req, res) {
    try {
        const offreId = req.params.id;
        if(!offreId) return res.status(404).json({message: "Not found!"});

        const offre = await Offre.findById(offreId).populate('secteur_id', 'secteur').populate('typecontrat_id', 'typeContrat');
        if(!offre) return res.status(404).json({message: "Not found!"});

        res.status(200).json({message: "This offre : ", data : offre});
    }catch(err) {
        res.status(500).json({message: "Error in view offre condida"});
    }
}

export async function postuler(req, res) {
    try {
        const userId = req.user.id;
        const { offre_id } = req.body;

        if (!userId)
            return res.status(404).json({ message: "There is no user logged in with this id!" });

        if (!offre_id)
            return res.status(404).json({ message: "There is no offer with this id!" });


        const offer = await Offre.findOne({_id: offre_id});
        if (!offer) {
            return res.status(404).json({ message: "Offer not found!" });
        }

        const existingApply = await Apply.findOne({user_id: userId, offre_id: offre_id });

        if (existingApply) {
            return res.status(400).json({ field: "apply" ,message: "You already applied to this offer!" });
        }

        const apply = await Apply.create({
            user_id: userId,
            offre_id: offre_id
        });

        res.status(201).json({ message: "Apply success", apply });

    } catch (err) {
        console.log(err, Offre);
        res.status(500).json({ message: "Error in postuler condida" });
    }
}

export async function companiesUser(req, res) {
    try {
        const userId = req.user.id;
        if(!userId) return res.status(404).json({message : "THere is no user logged in !"});

        const companyUser = await Company.find({user_id : userId});
        if(companyUser.length === 0) return res.status(404).json({message: "There is no companies yet! please create your company!"});

        res.status(200).json({message : "All companies for you : " , companiesUser});

    }catch(err) {
        res.status(500).json({message: "Error in companies user condia : " , err})
    }
}

