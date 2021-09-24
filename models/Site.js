const mongoose = require("mongoose");
const { Schema } = mongoose;

const siteSchema = new Schema({
    createdAt: { type: Date, default: Date.now },
    metadata: {
        projectId: String,
        createdBy: String,
        main: { type: Boolean, default: false },
        mainDate: { type: Date, default: Date.now },
        status: String,
        title: String,
        color: String,
        subtitle: String,
        description: String,
        socialMediaImage: "",
        ctaText: String,
        ctaUrl: String,
        theme: Object,
        logoType: String,
        logoText: String,
        logoUrl: String,
        logoAutoSize: { type: Boolean, default: true },
        logoHeight: Number,
        logoWidth: Number,
        logoPosition: { type: String, default: "left" },
        mainLinks: { type: Boolean, default: false },
        mainLinksPosition: { type: String, default: "left" },
        mainCTA:{ type: Boolean, default: false },
        mainCTAPosition: { type: String, default: "right" },
        mainCTAText: {type: String, default: "Push"},
        mainCTAURL: String,
        maxWidth: {type: Number, default: 1650},
        mobileBreakpoint: {type: Number, default: 800},
        fullWidth: {type: Number, default: false},
        mainCTAWidth: {type: Number, default: 222},
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
