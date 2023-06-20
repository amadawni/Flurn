const mongoose = require("mongoose");
// Define the Booking schema
const bookingSchema = new mongoose.Schema({
  seatId: String,
  //   seatNumber: String,
  seatClass: String,
  user: {
    name: String,
    phoneNumber: String,
  },
});
const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
