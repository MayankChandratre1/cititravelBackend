import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
});

const Banner = mongoose.model("Banner", bannerSchema);

export default Banner;
