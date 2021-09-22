const mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = new Schema({
    createdAt: { type: Date, default: Date.now },
    metadata: {
        createdBy: String,
        title: String,
    }
});

mongoose.model("product", productSchema);
