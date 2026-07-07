const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/Listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main(){
    await mongoose.connect(MONGO_URL);
}
// owner
const initDB = async () => {
    await Listing.deleteMany({});
    
    initData.data = initData.data.map((obj) => ({
        ...obj, 
        
        owner: new mongoose.Types.ObjectId("6a37a41d84a97d29a2e5d2e6") 
    }));
    
    await Listing.insertMany(initData.data);
    console.log("Data was initialized with your new ID!");
};


main()
  .then(async() => {
    console.log("connected to DB");
    await initDB();
    mongoose.connection.close();
  })
  .catch((err) => console.log(err));