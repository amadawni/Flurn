const mongoose = require("mongoose");
const fs = require("fs");
const csv = require("csv-parser");
const Seat = require("./models/Seat");
const Booking = require("./models/Booking");
const Pricing = require("./models/Pricing");
const { MongoClient } = require("mongodb");
// Connect to MongoDB
const connectionString =
  "mongodb+srv://119cs0026:m3k4HKqRDqtkamLg@flurn.pykta31.mongodb.net/";
const dbName = "flurn";
const collectionName = "seats";
// Create a MongoDB client
const client = new MongoClient(connectionString);
// import Seat from ''
//Inserting csv data into mongodb database.
// Read and parse the CSV file
const importData = fs.createReadStream("Seats.csv")
  .pipe(csv())
  .on("data", async (row) => {
    // console.log("first");
    try {
        // Create a new Seat document from the CSV row data
      //   const seat = new Seat({
      //       seatId: row.seatId,
      //       seatClass: row.seatClass,
      //       isBooked: false,
      //   });
        
      //   // Save the seat document to the database
      //   seat.save();
      //   // Seat.insertMany(seat);
      //   console.log(seat);
      // console.log(`Seat ${seat.seatId} saved to the database.`);

      await client.connect();
      const db = client.db(dbName);
      const collection = db.collection(collectionName);
      
      // Insert the row as a document in the collection
      await collection.insertOne(row);
      console.log("row");
    } catch (error) {
      console.error("An error occurred while saving the seat:", error);
    }
  })
  .on("end", () => {
    console.log("CSV file successfully processed.");
    process.exit(0); // Exit the script after processing the CSV file
  })
  .on("error", (error) => {
    console.error("An error occurred while reading the CSV file:", error);
    process.exit(1); // Exit the script with an error code
  });

// console.log(mongoUri);
// module.exports = importData;