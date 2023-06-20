const mongoose = require("mongoose");
// Define the Seat schema
const seatSchema = new mongoose.Schema({
  seatId: String,
  //   seatNumber: String,
  seatClass: String,
  isBooked: Boolean,
});
const Seat = mongoose.model("Seat", seatSchema);
module.exports = Seat;
