const mongoose = require("mongoose");
const { Schema } = mongoose;

const fontSchema = new Schema({
    createdAt: { type: Date, default: Date.now },
    metadata: {
        createdBy: String,
        title: String,
        fontName: String,
        weights: [String]
    }
});

mongoose.model("font", fontSchema);
