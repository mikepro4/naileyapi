const mongoose = require("mongoose");
const { Schema } = mongoose;

const projectSchema = new Schema({
    createdAt: { type: Date, default: Date.now },
    metadata: {
        createdBy: String,
        main: { type: Boolean, default: false },
        title: String,
        subtitle: String,
        description: String,
        domain: String,
    }
});

mongoose.model("project", projectSchema);
