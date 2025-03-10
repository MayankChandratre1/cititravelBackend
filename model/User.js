import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstname:{
        type: String,
        required: true
    },
    lastname:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    verified:{
        type: Boolean,
        default: false
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    verifiedAt:{
        type: Date
    },
    updatedAt:{
        type: Date
    },
    itinirary:{
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Itinirary"
    }
})

const User = mongoose.model("User", userSchema);

export default User;