const mongoose = require("mongoose");
const { Schema } = mongoose;

const pageSchema = new Schema({
    createdAt: { type: Date, default: Date.now },
    metadata: {
        createdBy: String,
        title: String,
        subtitle: String,
        description: String,
        url: String,
        sections: [Object],
        siteId: String,
    }
});

mongoose.model("page", pageSchema);
