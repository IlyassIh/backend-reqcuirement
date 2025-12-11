import User from "../models/User.js";
import bcrypt from 'bcrypt';
import Role from "../models/Role.js";
import Secteur from "../models/Secteur.js";
import jwt from 'jsonwebtoken';
import Contrat from "../models/Contrat.js";
import Offre from "../models/Offre.js";
import mongoose from "mongoose";
import Company from "../models/Company.js";


export async function adminRegister(req, res) {
    try {
        let { nom, prenom, email, password, confirmPassword, role } = req.body;

        nom = nom?.trim();
        prenom = prenom?.trim();

        email = email?.toLowerCase();

        if (!nom) return res.status(400).json({ field: "nom", message: "Veuillez entrer le nom" });
        if (!prenom) return res.status(400).json({ field: "prenom", message: "Veuillez entrer le prénom" });
        if (!email) return res.status(400).json({ field: "email", message: "Veuillez entrer l'email" });
        if (!password) return res.status(400).json({ field: "password", message: "Veuillez entrer le mot de passe" });
        if (!confirmPassword) return res.status(400).json({ field: "confirmPassword", message: "Veuillez confirmer le mot de passe" });
        if (!role) return res.status(400).json({ field: "role", message: "Veuillez entrer le role" });

        if (password.length < 8)
            return res.status(400).json({ field: "password", message: "Le mot de passe doit contenir au moins 8 caractères" });

        if (password !== confirmPassword)
            return res.status(400).json({ field: "password", message: "Veuillez entrer le même mot de passe" });

        const existEmail = await User.findOne({ email });
        if (existEmail) return res.status(400).json({ field: "email", message: "Email déjà utilisé" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.create({
            nom,
            prenom,
            email,
            password: hashedPassword,
            role_id: role
        });

        res.status(201).json({ message: "Admin has been created successfully!" });

    } catch (err) {
        res.status(500).json({ message: "Error in register admin: " + err });
    }
}

export async function adminLogin(req, res) {
    try {
        const { email, password } = req.body;

        if (!email) return res.status(400).json({ field: "email", message: "Email requis" });
        if (!password) return res.status(400).json({ field: "password", message: "Mot de passe requis" });

        const lowerEmail = email.toLowerCase();

        const user = await User.findOne({ email: lowerEmail }).populate('role_id', 'role');

        if (!user)
            return res.status(400).json({ field: 'email', message: "Email ou mot de passe incorrect!" });

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch)
            return res.status(400).json({ field: 'password', message: "Email ou mot de passe incorrect!" });

        if (user.role_id.role !== 'admin')
            return res.status(403).json({ message: "Accès refusé: ce compte n'est pas un administrateur" });

        const payload = {
            id: user._id,
            email: user.email,
            nom: user.nom,
            prenom: user.prenom,
            role: user.role_id.role
        };

        const token = jwt.sign(payload, process.env.SECRET, { expiresIn: '7d' });

        res.status(200).json({
            message: "Connexion réussie",
            token,
            payload
        });

    } catch (err) {
        res.status(500).json({ message: "Erreur dans la connexion admin", error: err.message });
    }
}

export async function addRoles(req, res) {
    try {

        let { role } = req.body;
        role = role.toLowerCase();

        if (!role) return res.status(400).json({ field: "role", message: "You need to enter a role!" });

        const existRole = await Role.findOne({ role });
        if (existRole) return res.status(400).json({ field: "role", message: "Role already exist!" });

        await Role.create({ role });

        res.status(201).json({ message: "Role have been added!" });
    } catch (err) {
        res.status(500).json({ message: "error in add roles : " + err });
    }
}

export async function deleteRole(req, res) {
    try {
        const { roleId } = req.body;

        if (!roleId) return res.status(400).json({ message: "roleId is required in body" });


        const role = await Role.findByIdAndDelete(roleId);

        if (!role) return res.status(404).json({ message: "Role not found!" });


        return res.status(200).json({ message: "Role deleted successfully!" });
    } catch (err) {
        return res.status(500).json({ message: "error in delete role : " + err });
    }
}

export async function addSecteur(req, res) {
    try {

        let { secteur } = req.body;
        secteur = secteur.toLowerCase()

        if (!secteur) return res.status(400).json({ field: "secteur", message: "You need to enter a sector!" });

        const existSecteur = await Secteur.findOne({ secteur });
        if (existSecteur) return res.status(400).json({ field: "secteur", message: "Already exist this sector!" });

        await Secteur.create({
            secteur
        });

        res.status(201).json({ message: "Secteur have been created!" });
    } catch (err) {
        res.status(500).json({ message: "error in secteur : " + err });
    }
}

export async function deleteSecteur(req, res) {
    try {
        const { secteurId } = req.body;
        if (!secteurId) return res.status(400).json({ message: "secteur is required" });

        const secteur = await Secteur.findByIdAndDelete(secteurId);
        if (!secteur) return res.status(404).json({ message: "Secteur not found!" });


        res.status(200).json({ message: "Secteur deleted successfully!" });
    }
    catch (err) {
        res.status(500).json({ message: "error in delete secteur : " + err });
    }
}

export async function showRoles(req, res) {
    try {
        const roles = await Role.find();
        res.status(200).json({ message: "All roles: ", data : roles })
    } catch (err) {
        req.status(500).json({ message: "Error in show roles! " + err })
    }

}

export async function showSecteurs(req, res) {
    try {
        const secteurs = await Secteur.find();
        res.status(200).json({ message: "All Secteurs : ", secteurs })
    } catch (err) {
        res.status(500).json({ message: "Error in show secteurs : ", err });
    }
}

export async function AllUsers(req, res) {
    try {
        const role = await Role.findOne({ role: "condidature" });
        if (!role) return res.status(404).json({ message: "No role Found!" });

        const users = await User.find({ role_id: role._id, soft_delete: false }).populate("role_id", "role -_id");

        if (users.length === 0) return res.status(404).json({ message: "Aucun Utilisateur!" });

        res.status(200).json({ message: "All users : ", data: users });
    } catch (err) {
        res.status(500).json({ message: "Error in show users: ", err });
    }
}

export async function AllEmp(req, res) {
    try {
        const role = await Role.findOne({ role: "employeur" });
        if (!role) return res.status(404).json({ message: "No role Found!" });

        const users = await User.find({ role_id: role._id, soft_delete: false }).populate("role_id", "role -_id");

        if (users.length === 0) return res.status(404).json({ message: "Aucun Emloyeur!" });

        res.status(200).json({ message: "All Employeur : ", data: users });
    } catch (err) {
        res.status(500).json({ message: "Error in show emp: ", err });
    }
}

export async function createEmployeur(req, res) {
    try {
        let { nom, prenom, email, password, confirmPassword, role } = req.body;
        email = email.toLowerCase();
        nom = nom.toLowerCase();
        prenom = prenom.toLowerCase();

        if (!nom) return res.status(400).json({ field: "nom", message: "Veuillez entrer le nom" });
        if (!prenom) return res.status(400).json({ field: "prenom", message: "Veuillez entrer le prénom" });
        if (!email) return res.status(400).json({ field: "email", message: "Veuillez entrer l'email" });
        if (!password) return res.status(400).json({ field: "password", message: "Veuillez entrer le mot de passe" });
        if (password.length < 8) return res.status(400).json({ field: "password", message: "Le mot de passe doit contenir au moins 8 caractères" });
        if (!confirmPassword) return res.status(400).json({ field: "confirmPassword", message: "Veuillez confirmer le mot de passe" });
        if (!role) return res.status(400).json({ field: "role", message: "Veuillez entrer le role" });

        if (password !== confirmPassword) return res.status(400).json({ field: "password", message: "Veuillez entrer le meme mot de passe" });

        const existEmail = await User.findOne({ email });
        if (existEmail) return res.status(400).json({ field: "email", message: "Email deja utiliser" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.create({
            nom, prenom, email, password: hashedPassword, role_id: role
        });

        res.status(201).json({ message: "Employeur have been created successfully!" });

    } catch (err) {
        res.status(500).json({ message: "error in create employeur : " + err });
    }
}

export async function updateAdminProfile(req, res) {
    try {
        const adminId = req.user.id;
        const { nom, prenom, email, oldPassword, newPassword, confirmPassword } = req.body;

        const admin = await User.findById(adminId);
        if (!admin) return res.status(404).json({ message: "Admin not found!" });

        if (nom && nom.trim() !== admin.nom) {
            admin.nom = nom.trim();
        }

        if (prenom && prenom.trim() !== admin.prenom) {
            admin.prenom = prenom.trim();
        }

        if (email && email.toLowerCase() !== admin.email.toLowerCase()) {
            const lowerEmail = email.toLowerCase();

            const existEmail = await User.findOne({ email: lowerEmail });
            if (existEmail && existEmail._id.toString() !== adminId) {
                return res.status(400).json({
                    field: "email",
                    message: "Email déjà utilisé"
                });
            }

            admin.email = lowerEmail;
        }

        if (oldPassword || newPassword || confirmPassword) {
            if (!oldPassword) {
                return res.status(400).json({ field: "oldPassword", message: "Veuillez entrer l'ancien mot de passe" });
            }
            if (!newPassword) {
                return res.status(400).json({ field: "newPassword", message: "Veuillez entrer le nouveau mot de passe" });
            }
            if (!confirmPassword) {
                return res.status(400).json({ field: "confirmPassword", message: "Veuillez confirmer le nouveau mot de passe" });
            }
            if (newPassword.length < 8) {
                return res.status(400).json({ field: "newPassword", message: "Le mot de passe doit contenir au moins 8 caractères" });
            }
            if (newPassword !== confirmPassword) {
                return res.status(400).json({ field: "newPassword", message: "Les nouveaux mots de passe ne correspondent pas" });
            }
            const isMatch = await bcrypt.compare(oldPassword, admin.password);
            if (!isMatch) {
                return res.status(400).json({ field: "oldPassword", message: "L'ancien mot de passe est incorrect" });
            }
            const salt = await bcrypt.genSalt(10);
            const hashedNewPassword = await bcrypt.hash(newPassword, salt);
            admin.password = hashedNewPassword;
        }



        await admin.save();

        res.status(200).json({
            message: "Admin profile updated successfully!!",
            user: admin
        });

    } catch (err) {
        res.status(500).json({ message: "Error in update admin profile: " + err });
    }
}

export async function addContrat(req, res) {
    try {
        const { typeContrat } = req.body;

        if (!typeContrat) return res.status(400).json({ field: "typeContrat", message: "You need to enter the contract!" });

        const existContrat = await Contrat.findOne({ typeContrat });
        if (existContrat) return res.status(400).json({ field: "typeContrat", message: "Already exist this contract!" });

        const contrat = await Contrat.create({ typeContrat });

        res.status(201).json({ message: "Type de contrat have been added!", contrat });
    } catch (err) {
        res.status(500).json({ message: "error in add contrat : " + err });
    }
}

export async function showContrats(req, res) {
    try {
        const contrats = await Contrat.find();
        res.status(200).json({ message: "All contrats: ", contrats })
    } catch (err) {
        res.status(500).json({ message: "error in show contrats : " + err });
    }
}

export async function deleteContrat(req, res) {
    try {
        const { contratId } = req.body;
        if (!contratId)
            return res.status(400).json({ message: "contratId is required" });

        if (!mongoose.Types.ObjectId.isValid(contratId))
            return res.status(400).json({ message: "Invalid contratId format" });

        const contrat = await Contrat.findByIdAndDelete(contratId);
        if (!contrat)
            return res.status(404).json({ message: "Contrat not found!" });

        return res.status(200).json({ message: "Contrat deleted successfully!" });
    } catch (err) {
        return res.status(500).json({ message: "error in delete contrat : " + err });
    }
}

export async function allOffres(req, res) {
    try {
        const offres = await Offre.find({status: false}).populate('company_id', 'company -_id').populate('secteur_id', 'secteur -_id').populate('typecontrat_id', 'typeContrat -_id');
        if (!offres) return res.status(404).json({ message: "Aucune offre trouver" });
        res.status(200).json({ message: "All offres: ", data: offres });
    } catch (err) {
        res.status(500).json({ message: "error in review offre : " + err });
    }
}

export async function deleteOffre(req, res) {
    try {
        const {offreId} = req.body;
        const offre = await Offre.findByIdAndDelete(offreId);
        if (!offre) return res.status(404).json({ message: "Offre not found!" });
        res.status(200).json({ message: "Offre deleted successfully!" });
    } catch (err) {
        res.status(500).json({ message: "error in delete offre : " + err });
    }
}

export async function acceptOffre(req, res) {
    try {
        const { offreId } = req.body;
        if (!offreId) return res.status(400).json({ message: "offreId is required in body" });

        const offre = await Offre.findById(offreId);
        if (!offre) return res.status(404).json({ message: "Offre not found!" });

        offre.status = true;
        await offre.save();
        res.status(200).json({ message: "Offre accepted successfully!", offre });
    } catch (err) {
        res.status(500).json({ message: "error in accept offre : " + err });
    }
}

export async function rejectOffre(req, res) {
    try {
        const { offreId } = req.body;
        if (!offreId) return res.status(400).json({ message: "offreId is required in body" });

        const offre = await Offre.findById(offreId);
        if (!offre) return res.status(404).json({ message: "Offre not found!" });

        offre.status = false;
        await offre.save();
        res.status(200).json({ message: "Offre rejected successfully!", offre });
    } catch (err) {
        res.status(500).json({ message: "error in reject offre : " + err });
    }
}

export async function allCompanies(req, res) {
    try {
        const companies = await Company.find().populate('user_id', 'nom prenom email -_id');

        if (!companies || companies.length === 0) {
            return res.status(404).json({ message: "Aucune company trouvée" });
        }

        return res.status(200).json({ message: "All companies : ", data: companies });
    } catch (err) {
        console.error("Error in allCompanies:", err);
        return res.status(500).json({ message: "Erreur dans allCompanies : " + err.message });
    }
}

export async function allOffresCompany(req, res) {
    try {
        const companyId = req.params.id;
        if (!companyId) return res.status(400).json({ message: "there is no id of this company" });

        const offreCompany = await Offre.find({ company_id: companyId });
        if (!offreCompany) return res.status(400).json({ message: "there is no offre for this company" });

        res.status(200).json({ message: "all offres for this company: ", offreCompany })

    } catch (err) {
        res.status(500).json({ message: "error in all offres company" })
    }
}
