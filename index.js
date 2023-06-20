// Import required modules
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Seat = require("./models/Seat");
const Booking = require("./models/Booking");
const Pricing = require("./models/Pricing");
// const importData = require('./import')
// Create an Express application
const app = express();

// Set up middleware
app.use(bodyParser.json());

// Connect to MongoDB
const mongoUri =
  "mongodb+srv://119cs0026:m3k4HKqRDqtkamLg@flurn.pykta31.mongodb.net/";
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  //   debug: true,
});
const db = mongoose.connection;
console.log("connected to mongodb successfully");

// API: Get All Seats
app.get("/seats", async (req, res) => {
  try {
    const seats = await Seat.find().sort("seatClass");
    res.json(seats);
    console.log(seats);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching seats." });
  }
});

// API: Get Seat Pricing
app.get("/seats/:id", async (req, res) => {
  try {
    const seat = await Seat.findById(req.params.id);
    if (!seat) {
      return res.status(404).json({ error: "Seat not found." });
    }

    console.log(req.params.id);
    const bookingsCount = await Seat.countDocuments({
      seatClass: seat.seatClass,
      isBooked: true,
    });
    const totalSeatsCount = await Seat.countDocuments({
      seatClass: seat.seatClass,
      // isBooked: true,
    });
    console.log(totalSeatsCount, bookingsCount);

    // const totalSeatsCount = await Seat.find({seatClass: })
    let pricing;
    const pricelist = await Pricing.find({ seatClass: seat.seatClass });
    if (bookingsCount < 0.4 * totalSeatsCount) {
      // const pricing = await Pricing.find({ seat.seatClass }).map((document) => document[minPrice]);
      let minPrice;
      let normalPrice;
      pricelist.forEach((item) => {
        minPrice = item.minPrice;
        normalPrice = item.normalPrice;
      });
      pricing = minPrice || normalPrice;
      // console.log(pricing);
    } else if (
      bookingsCount >= 0.4 * totalSeatsCount &&
      bookingsCount <= 0.6 * totalSeatsCount
    ) {
      let normalPrice;
      let maxPrice;
      pricelist.forEach((item) => {
        normalPrice = item.normalPrice;
        maxPrice = item.maxPrice;
      });
      pricing = normalPrice || maxPrice;
    } else {
      let maxPrice;
      let normalPrice;
      pricelist.forEach((item) => {
        normalPrice = item.normalPrice;
        maxPrice = item.maxPrice;
      });
      pricing = maxPrice || normalPrice;
    }
    console.log(pricing);
    res.json({ seat, pricing });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching seat pricing." });
  }
});

let calculatePricing = async (seatClass) => {
  let bookingsCount = await Seat.countDocuments({
    seatClass: seatClass,
    isBooked: true,
  });

  let totalSeatsCount = await Seat.countDocuments({
    seatClass,
  });
  console.log(
    "This is seat count and this is booking count",
    bookingsCount,
    totalSeatsCount
  );
  let pricing;
  const pricelist = Pricing.find({ seatClass });
  console.log(typeof(pricelist));
  if (bookingsCount < 0.4 * totalSeatsCount) {
    // const pricing = await Pricing.find({ seat.seatClass }).map((document) => document[minPrice]);
    // let minPrice;
    // let normalPrice;
    // pricelist.forEach((item) => {
    //   minPrice = item.minPrice;
    //   normalPrice = item.normalPrice;
    // });
    let minPrice = pricelist.minPrice;
    let normalPrice = pricelist.normalPrice;
    pricing = minPrice || normalPrice;
    console.log(minPrice, normalPrice);
  } else if (
    bookingsCount >= 0.4 * totalSeatsCount &&
    bookingsCount <= 0.6 * totalSeatsCount
  ) {
    let normalPrice;
    let maxPrice;
    pricelist.forEach((item) => {
      normalPrice = item.normalPrice;
      maxPrice = item.maxPrice;
    });
    pricing = normalPrice || maxPrice;
  } else {
    let maxPrice;
    let normalPrice;
    pricelist.forEach((item) => {
      normalPrice = item.normalPrice;
      maxPrice = item.maxPrice;
    });
    pricing = maxPrice || normalPrice;
  }
  console.log("This is pricing");

  return pricing;
};

// API: Create Booking
app.post("/bookings", async (req, res) => {
  const { seatIds, name, phoneNumber } = req.body;

  try {
    const seats = await Seat.find({
      seatId: { $in: seatIds },
      isBooked: false,
    });
    if (seats.length !== seatIds.length) {
      return res
        .status(400)
        .json({ error: "One or more seats are already booked." });
    }

    const bookings = [];
    let totalPrice = 0;
    //  console.log("first", seats);
    for (const seat of seats) {
      const booking = new Booking({
        seatId: seat.seatId,
        // seatNumber: seat.seatNumber,
        seatClass: seat.seatClass,
        user: {
          name,
          phoneNumber,
        },
      });

      totalPrice += await calculatePricing(seat.seatClass);
      console.log("Below is the last line to execute");

      seat.isBooked = true;
      await seat.save();
      console.log("seat");

      await booking.save();
      bookings.push(booking);
    }
    console.log(totalPrice)
    res.json({ bookings, totalPrice });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while creating the booking." });
  }
});

// API: Retrieve Bookings
app.get("/bookings", async (req, res) => {
  const userIdentifier = req.query.userIdentifier;

  if (!userIdentifier) {
    return res
      .status(400)
      .json({ error: "Please provide an email or phone number." });
  }

  try {
    const bookings = await Booking.find({
      "user.phoneNumber": userIdentifier,
    }).exec();
    if (bookings.length === 0) {
      return res.status(404).json({ error: "No bookings found for the user." });
    }

    res.json(bookings);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching bookings." });
  }
});

// Start the server
app.listen(3000, () => {
  console.log("Server listening on port 3000");
  // importData();
});
