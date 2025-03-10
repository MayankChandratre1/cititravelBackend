import mongoose from "mongoose";

const popularDestinationSchema = new mongoose.Schema({
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

const PopularDestination = mongoose.model("PopularDestination", popularDestinationSchema);

export default PopularDestination;
