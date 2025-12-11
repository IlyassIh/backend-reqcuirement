import jwt from 'jsonwebtoken';

export default function checkToken (req, res, next) {
    try {
        const authHeaders = req.headers.authorization;
        if (!authHeaders) return res.status(401).json({message: "THere is no token"});

        const token = authHeaders.split(' ')[1];
        if(!token) return res.status(401).json({message: "error while taking the token"});

        const decoded = jwt.verify(token, process.env.SECRET);
        if (!decoded) return res.status(400).json({message: "token not verify"});

        req.user = decoded;

        next();

        
    }catch(err) {
        res.status(500).json({message: "Error in check token : " , err});
    }
}