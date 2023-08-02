const mongoose = require("mongoose");
const mongoURI = "mongodb+srv://vercel-admin-user:CH1qnol3BnW52Fg7@cluster0.ud7pruv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

const connectToMongo = async () => {
  await mongoose.connect(mongoURI);
  console.log("Connected to Mongo successfully");
};

module.exports = connectToMongo;
