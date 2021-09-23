const _ = require("lodash");
const mongoose = require("mongoose");
const Themes = mongoose.model("theme");
const request = require('request-promise');

module.exports = app => {

    app.post("/themes/all", async (req, res) => {

        const query = Themes.find({
            "metadata.title": {
				$regex: new RegExp(req.body.title),
				$options: "i"
			}
        })

		return Promise.all(
			[query, Themes.countDocuments()]
		).then(
			results => {
				return res.json(results[0]);
			}
		);
	});

	// ===========================================================================

	app.post("/themes/search", async (req, res) => {
        const { criteria, sortProperty, offset, limit, order } = req.body;
        
		const query = Themes.find(buildQuery(criteria))
			.sort({ [sortProperty]: order })
			.skip(offset)
			.limit(limit);

		return Promise.all(
			[query, Themes.find(buildQuery(criteria)).countDocuments()]
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

	app.post("/themes/create", async (req, res) => {
		const Theme = await new Themes({
			createdAt: new Date(),
            metadata: req.body.metadata,
		}).save();
		res.json(Theme);
	});

	// ===========================================================================

	app.post("/themes/update", async (req, res) => {
		Themes.update(
			{
				_id: req.body.themeId
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
					Themes.findOne({ _id: req.body.themeId }, async (err, Theme) => {
						if (Theme) {
							res.json({ success: "true", info: info, theme: Theme });
						}
					});
				}
			}
		);
	});

	// ===========================================================================

	app.post("/themes/delete", async (req, res) => {
		Themes.remove({ _id: req.body.themeId }, async (err) => {
			if (err) return res.send(err);
			res.json({
				success: "true",
				message: "deleted Shape"
			});
		});
	});

	// ===========================================================================

	app.post("/themes/item", async (req, res) => {
		Themes.findOne({ _id: req.body.themeId }, async (err, Shape) => {
			if (Shape) {
				res.json(Shape);
			}
		});
    });

    // ===========================================================================

	app.post("/themes/main", async (req, res) => {
        
        const query = Themes.find({ "metadata.main": true })
			.sort({ "metadata.mainDate": -1 })
			.skip(0)
            .limit(1);
            
            return Promise.all(
                [query, Themes.find().countDocuments()]
            ).then(
                results => {
                    return res.json({
                        main: results[0][0],
                        count: results[1]
                    })
                }
            );
    });
    
    // ===========================================================================

	app.post("/themes/setMain", async (req, res) => {
        Themes.findOne({ "metadata.main": true }, async (err, theme) => {
			if (theme) {
                Themes.update(
                    {
                        _id: theme._id
                    },
                    {
                        $set: { 
                            "metadata.main": false
                        }
                    },
                    async (err, info) => {
                        if (err) res.status(400).send({ error: "true", error: err });
                        if (info) {
                            Themes.update(
                                {
                                    _id: req.body.theme._id
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
                Themes.update(
                    {
                        _id: req.body.theme._id
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

	if (criteria.createdBy) {
		
	}

	return query
};
