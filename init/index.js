const mongoose = require("mongoose");
const Listing = require("../models/listing");

// 👇 IMPORTANT CHANGE
const data = require("./data.js");

//console.log("CHECK IMPORT:", data); // 👈 MUST SHOW ARRAY

const MONGO_URL = "mongodb://127.0.0.1:27017/rentalSystem";

async function main() {
  console.log("File started...");

  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to DB");

    await Listing.deleteMany({});
    console.log("Old data deleted");

    await Listing.insertMany(data);
    console.log("Data inserted");

    mongoose.connection.close();
  } catch (err) {
    console.log("ERROR:", err);
  }
}

main();