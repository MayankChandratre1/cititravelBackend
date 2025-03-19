import Itinirary from "../model/Itinirary.js";
import User from "../model/User.js";

export const getUser = async (req, res) => {
    try {
        const { id } = req.user;
        if (!id) {
            return res.status(400).json({ error: "Id required" });
        }
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const isVerified = user.verified;

        if(!isVerified){
            return res.status(401).json({ error: "User not verified" });
        }
        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
 }


 export const getItinirary = async (req, res) => {
    try {
        const { id } = req.user;
        if (!id) {
            return res.status(400).json({ error: "Id required" });
        }
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const isVerified = user.verified;

        if(!isVerified){
            return res.status(401).json({ error: "User not verified" });
        }

        const it = await Itinirary.find({user: id});
        res.json({ user, it });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
 }

