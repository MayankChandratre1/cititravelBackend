
import jwt from "jsonwebtoken";

export const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET);
}

export const generateAdminToken = (payload) => {
    return jwt.sign(payload, process.env.ADMIN_JWT_SECRET);
}

export const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
}