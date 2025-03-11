const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  permissions: [{ type: String, required: true, index: true }],
},{versionKey:false,timestamps:true});

module.exports = mongoose.model("Role", roleSchema);
