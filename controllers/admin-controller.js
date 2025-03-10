import Admin from "../model/Admin.js";
import { compare, hash } from "../util/bcrypt-util.js";
import { generateAdminToken } from "../util/jwt-util.js";

 
 export const AdminRegister = async (req, res) => {
    try {
        const {email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and Password are required" });
        }
        const hashedPassword = await hash(password);
        const user = await Admin.create({
            email,
            password: hashedPassword
        })
        const token = generateAdminToken({ id: user._id, email: user.email });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
 }

 export const AdminLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: "username and Password are required" });
        }
        const user = await Admin.findOne({ email:username });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const isMatch = await compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        
        const token = generateAdminToken({ id: user._id, email: user.email });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
 }
