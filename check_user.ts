import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const userSchema = new mongoose.Schema({
  email: String,
  whatsappNumber: String,
  role: String,
  businessName: String
});

const User = mongoose.model("User", userSchema);

async function checkUser() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/cartlist");
  const user = await User.findOne({ email: "chinonso.ejimofor@baigewallet.com" });
  console.log("USER DATA:", JSON.stringify(user, null, 2));
  process.exit(0);
}

checkUser().catch(console.error);
