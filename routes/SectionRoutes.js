const _ = require("lodash");
const mongoose = require("mongoose");
const Sections = mongoose.model("section");

module.exports = app => {

	// ===========================================================================

	app.post("/sections/search", async (req, res) => {
        const { criteria, sortProperty, offset, limit, order } = req.body;
        
		const query = Sections.find(buildQuery(criteria))
			.sort({ [sortProperty]: order })
			.skip(offset)
			.limit(limit);

		return Promise.all(
			[query, Sections.find(buildQuery(criteria)).countDocuments()]
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

	app.post("/sections/create", async (req, res) => {
		const Section = await new Sections({
			createdAt: new Date(),
            metadata: req.body.metadata,
		}).save();
		res.json(Section);
	});

	// ===========================================================================

	app.post("/sections/update", async (req, res) => {
		Sections.update(
			{
				_id: req.body.sectionId
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
					Sections.findOne({ _id: req.body.sectionId }, async (err, Section) => {
						if (Section) {
							res.json({ success: "true", info: info, section: Section });
						}
					});
				}
			}
		);
	});

	// ===========================================================================

	app.post("/sections/delete", async (req, res) => {
		Sections.remove({ _id: req.body.sectionId }, async (err) => {
			if (err) return res.send(err);
			res.json({
				success: "true",
			});
		});
	});

	// ===========================================================================

	app.post("/sections/item", async (req, res) => {
		Sections.findOne({ _id: req.body.sectionId }, async (err, Shape) => {
			if (Shape) {
				res.json(Shape);
			}
		});
    });

    // ===========================================================================

	app.post("/sections/main", async (req, res) => {
        
        const query = Sections.find({ "metadata.main": true })
			.sort({ "metadata.mainDate": -1 })
			.skip(0)
            .limit(1);
            
            return Promise.all(
                [query, Sections.find().countDocuments()]
            ).then(
                results => {
                    return res.json({
                        main: results[0][0]
                    })
                }
            );
    });
    
    // ===========================================================================

	app.post("/sections/setMain", async (req, res) => {
        Sections.findOne({ "metadata.main": true }, async (err, section) => {
			if (section) {
                Sections.update(
                    {
                        _id: section._id
                    },
                    {
                        $set: { 
                            "metadata.main": false
                        }
                    },
                    async (err, info) => {
                        if (err) res.status(400).send({ error: "true", error: err });
                        if (info) {
                            Sections.update(
                                {
                                    _id: req.body.section._id
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
                Sections.update(
                    {
                        _id: req.body.section._id
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
