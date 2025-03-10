import mongoose, { disconnect } from "mongoose";

const featuredPropertySchema = new mongoose.Schema({
  image: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  rating:{
    type: Number,
    required: true
  },
  originalPrice:{
    type: Number,
    required: true
  },
    discountPrice:{
        type: Number,
        required: true
    },
    discount:{
        type: Number,
        required: true
    },
    reviews:{
        type: Number,
        required: true
    },
    city:{
        type: String,
        required: true
    },
    country:{
        type: String,
    }
});

const FeaturedProperty = mongoose.model("FeturedProperty", featuredPropertySchema);

export default FeaturedProperty;
