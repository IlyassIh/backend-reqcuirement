import Company from "../models/Company.js";
import Offre from "../models/Offre.js";
import { allOffresCompany } from "./AdminController.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import Apply from "../models/Apply.js";

export async function createCompany(req, res) {
    try {
        console.log('Body:', req.body);
    console.log('User:', req.user);
        const userId = req.user.id;
        const { company } = req.body;


        if (!company) return res.status(400).json({ field: "nameCompany", message: "Nom de l'entreprise est obligatoire!" });

        const companyCreate = await Company.create({
            company: company,
            user_id: userId
        });

        res.status(201).json({ message: "Company have been created! ", companyCreate });
    } catch (err) {
        res.status(500).json({ message: "Error in create company : ", err })
    }
}

export async function createOffre(req, res) {
    try {
        const userId = req.user.id;
        const { offre, desc, salaire, secteur_id, contrat, company_id } = req.body;

        if (!offre) return res.status(400).json({ field: "offre", message: "Nom de l'offre est obligatoire!" });
        if (!desc) return res.status(400).json({ field: "desc", message: "Description de l'offre est obligatoire!" });
        if (!secteur_id) return res.status(400).json({ field: "secteur_id", message: "Secteur de l'offre est obligatoire!" });
        if (!company_id) return res.status(400).json({ field: "company_id", message: "You must select a company!" });

        const company = await Company.findOne({ _id: company_id, user_id: userId });

        if (!company) {
            return res.status(403).json({
                message: "You cannot create an offre for a company that is not yours!"
            });
        }

        const offreCreate = await Offre.create({
            offre,
            description: desc,
            salaire,
            status: false,
            company_id,
            secteur_id,
            typecontrat_id: contrat
        });

        res.status(201).json({ message: "Offre created!", offreCreate });

    } catch (err) {
        res.status(500).json({ message: "Error in create offre", err });
    }
}


export async function deleteCompany(req, res) {
    try {
        const userId = req.user.id;
        const { company_id } = req.body;

        if (!company_id) {
            return res.status(400).json({ field: "companyId", message: "companyId est obligatoire" });
        }

        const company = await Company.findOneAndDelete({
            _id: company_id,
            user_id: userId
        });

        if (!company) {
            return res.status(404).json({ message: "Aucune entreprise trouvée" });
        }

        await Offre.deleteMany({ company_id: company_id });

        res.status(200).json({
            message: "Company and all related offers deleted successfully",
            company
        });

    } catch (err) {
        res.status(500).json({ message: "Error in delete company", err });
    }
}

export async function deleteOffre(req, res) {
    try {
        const offreId = req.params.id;
        if (!offreId) return res.status(400).json({ field: "offreId", message: "offreId est obligatoire" });
        // const userId = req.user.id;
        // const company = await Company.findOne({ user_id: userId });
        // if (!company) return res.status(404).json({ message: "Aucune entreprise trouver pour cet utilisateur" });
        const offre = await Offre.findOneAndDelete({ _id: offreId });
        if (!offre) return res.status(404).json({ message: "Aucune offre trouver pour cette entreprise" });
        res.status(200).json({ message: "Offre deleted successfully", offre });
    } catch (err) {
        res.status(500).json({ message: "Error in delete offre : ", err })
    }
}

// export async function updateOffre(req, res) {
//     try {
//         const offreId = req.params.id;
//         const userId = req.user.id;
//         const { offre, desc, salaire, secteur_id, contrat } = req.body;
//         const company = await Company.findOne({ user_id: userId });
//         if (!company) return res.status(404).json({ message: "Aucune entreprise trouver pour cet utilisateur" });
//         const updatedOffre = await Offre.findOneAndUpdate(
//             { _id: offreId, company_id: company._id },
//             {
//                 offre: offre,
//                 description: desc,
//                 salaire: salaire,
//                 secteur_id: secteur_id,
//                 typecontrat_id: contrat
//             },
//             { new: true }
//         );
//         if (!updatedOffre) return res.status(404).json({ message: "Aucune offre trouver pour cette entreprise" });
//         res.status(200).json({ message: "Offre updated successfully", updatedOffre });
//     } catch (err) {
//         res.status(500).json({ message: "Error in update offre : ", err })
//     }
// }

export async function allCompanies(req, res) {
    try {
        const userId = req.user.id;
        if (!userId) return res.status(404).json({ message: "There is no user connected!" });

        const allCompanies = await Company.find({ user_id: userId });
        if (allCompanies.length === 0) return res.status(400).json({ message: "There is no company yet!" });

        return res.status(200).json({ message: "All companies. ", data : allCompanies });

    } catch (err) {
        res.status(500).json({ message: "Error in all companies emp!" });
    }
}

export async function updateCompany(req, res) {
    try {
        const companyId = req.params.id;
        const { nameCompany } = req.body;
        if (!nameCompany) return res.status(400).json({ field: "nameCompany", message: "You must enter a name for the company!" });

        const newCompanyName = await Company.findByIdAndUpdate(companyId, { company: nameCompany }, { new: true });
        if (!newCompanyName) return res.status(404).json({ message: "There is no company" });
        // const updated = await Company.findById({ _id: companyId });

        res.status(200).json({ message: "Name of the company updated!", newCompanyName });
    } catch (err) {
        return res.status(500).json({ message: "Error in update company emp!", err });
    }
}

export async function allOffersUser(req, res) {
    try {
        const userId = req.user.id;
        if (!userId) return res.status(404).json({ message: "There is no user yet!" });

        const company = await Company.find({ user_id: userId });
        if (company.length === 0) return res.status(404).json({ message: "You do not have any company!" });

        const companyIds = company.map(c => c._id);

        const offers = await Offre.find({ company_id: { $in: companyIds } }).populate('secteur_id', 'secteur').populate('typecontrat_id', 'typeContrat');
        if (offers.length === 0) return res.status(404).json({ message: "There is no offers for your companies" });

        res.status(200).json({ message: "All offers. ", data : offers })
    } catch (err) {
        return res.status(500).json({ message: "Error in all offers emp" })
    }
}

export async function allOffresComp(req, res) {
    try {
        const companyId = req.params.id;
        if (!companyId) return res.status(400).json({ field: "companyId", message: "companyId est obligatoire" });

        const offers = await Offre.find({ company_id: companyId });
        if (offers.length === 0) return res.status(404).json({ message: "There is no offers for this company" });

        res.status(200).json({ message: "All offers for the company.", offers });

    } catch (err) {
        return res.status(500).json({ message: "Error in all offers of company emp" });
    }
}

export async function updateOffre(req, res) {
    try {
        const offreId = req.params.id;
        const userId = req.user.id;

        const { offre, desc, salaire, secteur_id, contrat } = req.body;

        const companies = await Company.find({ user_id: userId });
        if (companies.length === 0)
            return res.status(404).json({ message: "Aucune entreprise trouvée pour cet utilisateur" });

        const companyIds = companies.map(c => c._id);

        const updatedOffre = await Offre.findOneAndUpdate(
            { _id: offreId, company_id: { $in: companyIds } },
            {
                offre: offre,
                description: desc,
                salaire: salaire,
                secteur_id: secteur_id,
                typecontrat_id: contrat
            },
            { new: true }
        );

        if (!updatedOffre)
            return res.status(404).json({ message: "Aucune offre trouvée pour cette entreprise" });

        res.status(200).json({ message: "Offre updated successfully", updatedOffre });

    } catch (err) {
        return res.status(500).json({ message: "Error in update offre emp", err });
    }
}

export async function deleteAccount(req, res) {
    try {
        const userId = req.user.id;
        console.log("userId =", userId);

        const companies = await Company.find({ user_id: userId });
        console.log("Companies =", companies);

        const companyIds = companies.map(c => c._id);
        console.log("companyIds =", companyIds);


        const offreDelete = await Offre.deleteMany({ company_id: { $in: companyIds } });
        console.log("Deleted offers =", offreDelete);

        const companyDelete = await Company.deleteMany({ user_id: userId });
        console.log("Deleted companies =", companyDelete);


        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }


        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                soft_delete: true,
                email: `deleted_${Date.now()}_${user.email}`
            },
            { new: true }
        );
        console.log("Updated user =", updatedUser);

        return res.status(200).json({
            message: "Employer account and all related companies and offers deleted successfully"
        });

    } catch (err) {
        console.error("ERROR => ", err);
        return res.status(500).json({ message: "Error in delete employer account", err });
    }
}


export async function updateProfile(req, res) {
    try {
        const userId = req.user.id;
        const { nom, prenom, email, oldPassword, password, confirmPassword } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (email) {
            const emailToLower = email.toLowerCase();

            if (emailToLower !== user.email) {
                const emailExists = await User.findOne({ email: emailToLower });
                if (emailExists) {
                    return res.status(400).json({ field: "email", message: "Email already in use" });
                }
                user.email = emailToLower;
            }
        }

        if (nom) user.nom = nom;
        if (prenom) user.prenom = prenom;

        if (oldPassword || password || confirmPassword) {

            if (!oldPassword)
                return res.status(400).json({ field: "oldPassword", message: "You need to enter your old password" });

            if (!password)
                return res.status(400).json({ field: "password", message: "You need to enter your password" });

            if (!confirmPassword)
                return res.status(400).json({ field: "confirmPassword", message: "You need to enter your new password confirmation" });

            if (password !== confirmPassword)
                return res.status(400).json({ field: "password", message: "Passwords do not match" });

            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch)
                return res.status(400).json({ field: "oldPassword", message: "Incorrect old password" });

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();

        res.status(200).json({ message: "Profile updated successfully", updatedUser: user });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error in update profile employer", err });
    }
}

export async function showApplies(req, res) {
    try {
        const applies = await Apply.find()
            .populate("user_id", "nom prenom email") 
            .populate("offre_id", "offre description salaire");

        res.status(200).json({
            message: "All applies",
            applies
        });

    } catch(err) {
        res.status(500).json({ message: "Error in show applies emp!", err });
    }
}





