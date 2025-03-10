import mongoose from "mongoose";

const bestOfferSchema = new mongoose.Schema({
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
    type:{
        type: String,
        enum:["SpecialOffer","Flights","Cabs", "Hotels","Combo"],
        required: true
    },
    country:{
        type: String,
    }
});

const BestOffer = mongoose.model("BestOffer", bestOfferSchema);

export default BestOffer;
