const mongoose = require("mongoose");
const { Schema } = mongoose;

const sectionSchema = new Schema({
    createdAt: { type: Date, default: Date.now },
    metadata: {
        createdBy: String,
        title: String,
    }
});

mongoose.model("section", sectionSchema);
