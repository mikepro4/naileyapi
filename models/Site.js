const mongoose = require("mongoose");
const { Schema } = mongoose;

const siteSchema = new Schema({
    createdAt: { type: Date, default: Date.now },
    status: String,
    metadata: {
        createdBy: String,
        main: { type: Boolean, default: false },
        mainDate: { type: Date, default: Date.now },
        title: String,
        subtitle: String,
        description: String,
        socialMediaImage: "",
        ctaText: String,
        ctaUrl: String,
        pages: [
            {
                title: String,
                sections: [
                    {
                        type: String,
                        title: String,
                        content: String
                    }
                ],
                images: [
                    {
                        imageUrl: String
                    }
                ]
            }
        ]
    }
});

mongoose.model("site", siteSchema);
