import jwt from 'jsonwebtoken';

export default function checkRole(...allowedRoles) {
    return (req, res, next) => {

        try {
            const authHeader = req.headers.authorization;
            if(!authHeader) return res.status(401).json({message: "Unauthorized"});

            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.SECRET);

            req.user = decoded

            if (!allowedRoles.includes(req.user.role)) return res.status(403).json({ message: "Access denied: insufficient role" });

            next();
        } catch (err) {
            res.status(500).json({message: "Error in checkroles : ", err})
        }

    }
}