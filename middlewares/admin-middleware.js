import jwt from 'jsonwebtoken';

const admin_auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: "Authentication required. Please provide a valid token." });
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({ message: "Invalid or expired token." });
        }
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};

export default admin_auth;
