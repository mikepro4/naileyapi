const mongoose = require("mongoose");
const { Schema } = mongoose;

const themeSchema = new Schema({
    title: String,
    textColor: String,
    backgroundColor: String,
    buttonType: String,
    gradientStart: String,
    gradientEnd: String,
    imageEffect: String,
    active: { type: Date, default: false },
});

mongoose.model("theme", themeSchema);
