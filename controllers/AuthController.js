import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

export async function register(req, res) {
    try {
        let {nom, prenom, email, password, confirmPassword, role} = req.body;
        nom = nom.toLowerCase();
        prenom = prenom.toLowerCase();
        email = email.toLowerCase();

        if (!nom) return res.status(400).json({field: "nom", message: "Nom est obligatoire!"});

        if (!prenom) return res.status(400).json({field: "prenom", message: "Prenom est obligatoire!"});

        if (!email) return res.status(400).json({field: "email", message: "Email est obligatoire!"});

        if (!password) return res.status(400).json({field: "password", message: "Mot de passe est obligatoire!"});

        if (!confirmPassword) return res.status(400).json({field: "confirmPassword", message: "Confirmation de mot de passe est obligatoire!"});

        if (!role) return res.status(400).json({field: "role", message: "Role est obligatoire!"});

        const existEmail = await User.findOne({email: email});
        if (existEmail) return res.status(400).json({field: "email", message: "Email deja utiliser!"});

        if(password !== confirmPassword) return res.status(400).json({field: "password", message: "Veuiller enter le meme mot de passe!"});

        const salt = await bcrypt.genSalt(10);
        const hashPass = await bcrypt.hash(password, salt);

        const user = await User.create({
            nom, prenom, email, password: hashPass, role_id: role
        });

        const populatedUser = await User.findById(user._id).populate('role_id', 'role -_id');


        res.status(201).json({message: "User have been created! ", populatedUser});

    }catch(err) {
        res.status(500).json({message: "Error in auth user : " , err})
    }
}

export async function login(req, res) {
    try {
        let {email, password} = req.body;
        email = email.toLowerCase();

        if (!email) return res.status(400).json({field: "email", message: "Email est obligatoire!"});
        if (!password) return res.status(400).json({field: "password", message: "Mot de passe est obligatoire!"});

        const user = await User.findOne({email: email}).populate('role_id', 'role');
        if (!user) return res.status(400).json({field: "email", message: "Email ou mot de passe incorrect!"});

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({field: "email", message: "Email ou mot de passe incorrect!"});

        if(user.soft_delete === true) return res.status(403).json({message: "Votre compte a été désactivé."});

        const payload = {
            id: user._id,
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            role: user.role_id.role,
        };    

        const token = jwt.sign(payload, process.env.SECRET, {expiresIn: '7d'});
        res.status(200).json({message: "User logged in successfully", token, payload});
    }catch(err) {
        res.status(500).json({message: "Error in login user : " , err})
    }
}