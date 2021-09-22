const mongoose = require("mongoose");
const { Schema } = mongoose;

const themeSchema = new Schema({
    createdAt: { type: Date, default: Date.now },
    metadata: {
        createdBy: String,
        main: { type: Boolean, default: false },
        mainDate: { type: Date, default: Date.now },
        title: String,
        subtitle: String,
        description: String,
    }
});

mongoose.model("theme", themeSchema);
