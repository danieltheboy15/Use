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

async function checkUsers() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/cartlist");
  const users = await User.find({}).limit(10);
  console.log("TOTAL USERS FOUND:", users.length);
  users.forEach(u => console.log(`- ${u.email} (${u.role}): ${u.whatsappNumber}`));
  process.exit(0);
}

checkUsers().catch(console.error);
