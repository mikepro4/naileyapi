const _ = require("lodash");
const mongoose = require("mongoose");
const Fonts = mongoose.model("font");

module.exports = app => {

	// ===========================================================================

	app.post("/fonts/search", async (req, res) => {
        const { criteria, sortProperty, offset, limit, order } = req.body;
        
		const query = Fonts.find(buildQuery(criteria))
			.sort({ [sortProperty]: order })
			.skip(offset)
			.limit(limit);

		return Promise.all(
			[query, Fonts.find(buildQuery(criteria)).countDocuments()]
		).then(
			results => {
				return res.json({
					all: results[0],
					count: results[1],
					offset: offset,
					limit: limit
				});
			}
		);
	});

	// ===========================================================================

	app.post("/fonts/create", async (req, res) => {
		const Font = await new Fonts({
			createdAt: new Date(),
            metadata: req.body.metadata,
		}).save();
		res.json(Font);
	});

	// ===========================================================================

	app.post("/fonts/update", async (req, res) => {
		Fonts.update(
			{
				_id: req.body.fontId
			},
			{
				$set: { 
                    metadata: req.body.metadata,
                    status: req.body.status 
                }
			},
			async (err, info) => {
				if (err) res.status(400).send({ error: "true", error: err });
				if (info) {
					Fonts.findOne({ _id: req.body.fontId }, async (err, Font) => {
						if (Font) {
							res.json({ success: "true", info: info, font: Font });
						}
					});
				}
			}
		);
	});

	// ===========================================================================

	app.post("/fonts/delete", async (req, res) => {
		Fonts.remove({ _id: req.body.fontId }, async (err) => {
			if (err) return res.send(err);
			res.json({
				success: "true",
			});
		});
	});

	// ===========================================================================

	app.post("/fonts/item", async (req, res) => {
		Fonts.findOne({ _id: req.body.fontId }, async (err, Shape) => {
			if (Shape) {
				res.json(Shape);
			}
		});
    });

    // ===========================================================================

	app.post("/fonts/main", async (req, res) => {
        
        const query = Fonts.find({ "metadata.main": true })
			.sort({ "metadata.mainDate": -1 })
			.skip(0)
            .limit(1);
            
            return Promise.all(
                [query, Fonts.find().countDocuments()]
            ).then(
                results => {
                    return res.json({
                        main: results[0][0]
                    })
                }
            );
    });
    
    // ===========================================================================

	app.post("/fonts/setMain", async (req, res) => {
        Fonts.findOne({ "metadata.main": true }, async (err, font) => {
			if (font) {
                Fonts.update(
                    {
                        _id: font._id
                    },
                    {
                        $set: { 
                            "metadata.main": false
                        }
                    },
                    async (err, info) => {
                        if (err) res.status(400).send({ error: "true", error: err });
                        if (info) {
                            Fonts.update(
                                {
                                    _id: req.body.font._id
                                },
                                {
                                    $set: { 
                                        "metadata.main": req.body.main
                                    }
                                },
                                async (err, info) => {
                                    if (err) res.status(400).send({ error: "true", error: err });
                                    if (info) {
                                        res.json("ok")
                                    }
                                }
                            );
                        }
                    }
                );
			} else {
                Fonts.update(
                    {
                        _id: req.body.font._id
                    },
                    {
                        $set: { 
                            "metadata.main": req.body.main
                        }
                    },
                    async (err, info) => {
                        if (err) res.status(400).send({ error: "true", error: err });
                        if (info) {
                            res.json("ok")
                        }
                    }
                );
            }
		})
	})

};

const buildQuery = criteria => {
	const query = {};

	return query
};
