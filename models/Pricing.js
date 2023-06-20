const mongoose = require("mongoose");
// Define the Pricing schema
const seatPricingSchema = new mongoose.Schema({
  //   seatId: String,
  seatClass: String,
  min_price: String,
  normalPrice: String,
  maxPrice: String,
});
const Pricing = mongoose.model("Pricing", seatPricingSchema);

module.exports = Pricing;
