import { sendVerificationEmail } from "../config/email.config.mjs";
import OTP from "../model/Otp.js";
import User from "../model/User.js";
import { compare, hash } from "../util/bcrypt-util.js";
import { generateToken } from "../util/jwt-util.js";

 
 export const register = async (req, res) => {
    try {
        const {firstname, lastname, email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and Password are required" });
        }
        const hashedPassword = await hash(password);
        const user = await User.create({
            firstname,
            lastname,
            email,
            password: hashedPassword,
            verified: true,
            verifiedAt: new Date()
        })

        const token = generateToken({ id: user._id, email: user.email });

        res.json({ token, email:user.email });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
 }

 export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and Password are required" });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const isMatch = await compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const isVerified = user.verified;

        if(!isVerified){
            return res.status(401).json({ error: "User not verified" });
        }

        const token = generateToken({ id: user._id, email: user.email });
        res.json({ token, email:user.email, user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
 }

 export const verify = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ error: "Email and OTP are required" });
        }
        
        const existing_otp = await OTP.findOne({ email, otp });

        if(!existing_otp){
            return res.status(400).json({ error: "Invalid OTP" });
        }

    
        await existing_otp.deleteOne()
        res.json({ message: "User verified successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
 }

 export const sendOtpEmail = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }
        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        const existing_otp = await OTP.findOne({ email})

        if(existing_otp){
            await existing_otp.deleteOne()
        }

        await OTP.create({
            otp,
            email,
            type: "verification"
        })
        await sendVerificationEmail(email, otp);
        res.json({ message: "Verification email sent successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
 }