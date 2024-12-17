const crypto = require("crypto");

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "u9BvJ4rT8wKxZ2mQ7sR5hY1pD0fVxC3l"; // Must be 256 bits (32 characters)
const IV_LENGTH = 16;

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

function decrypt(text) {
  if (!text) return ""; // Handle undefined or null input
  try {
    const [iv, encryptedText] = text.split(":");
    if (!iv || !encryptedText) throw new Error("Invalid encrypted data format.");
    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), Buffer.from(iv, "hex"));
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.log("Decryption error!");
    return "";
  }
}


module.exports = { encrypt, decrypt };
