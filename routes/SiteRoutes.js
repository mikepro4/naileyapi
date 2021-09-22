const _ = require("lodash");
const mongoose = require("mongoose");
const Sites = mongoose.model("site");
const request = require('request-promise');

module.exports = app => {

	// ===========================================================================

	app.post("/sites/search", async (req, res) => {
        const { criteria, sortProperty, offset, limit, order } = req.body;
        
		const query = Sites.find(buildQuery(criteria))
			.sort({ [sortProperty]: order })
			.skip(offset)
			.limit(limit);

		return Promise.all(
			[query, Sites.find(buildQuery(criteria)).countDocuments()]
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

	app.post("/sites/create", async (req, res) => {
		const Site = await new Sites({
			createdAt: new Date(),
            metadata: req.body.metadata,
		}).save();
		res.json(Site);
	});

	// ===========================================================================

	app.post("/sites/update", async (req, res) => {
		Sites.update(
			{
				_id: req.body.siteId
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
					Sites.findOne({ _id: req.body.siteId }, async (err, Site) => {
						if (Site) {
							res.json({ success: "true", info: info, site: Site });
						}
					});
				}
			}
		);
	});

	// ===========================================================================

	app.post("/sites/delete", async (req, res) => {
		Sites.remove({ _id: req.body.siteId }, async (err) => {
			if (err) return res.send(err);
			res.json({
				success: "true",
				message: "deleted Shape"
			});
		});
	});

	// ===========================================================================

	app.post("/sites/item", async (req, res) => {
		Sites.findOne({ _id: req.body.siteId }, async (err, Shape) => {
			if (Shape) {
				res.json(Shape);
			}
		});
    });

    // ===========================================================================

	app.post("/sites/main", async (req, res) => {
        
        const query = Sites.find({ "metadata.main": true })
			.sort({ "metadata.mainDate": -1 })
			.skip(0)
            .limit(1);
            
            return Promise.all(
                [query]
            ).then(
                results => {
                    return res.json(results[0][0]);
                }
            );
    });
    
    // ===========================================================================

	app.post("/sites/setMain", async (req, res) => {
        Sites.findOne({ "metadata.main": true }, async (err, site) => {
			if (site) {
                Sites.update(
                    {
                        _id: site._id
                    },
                    {
                        $set: { 
                            "metadata.main": false
                        }
                    },
                    async (err, info) => {
                        if (err) res.status(400).send({ error: "true", error: err });
                        if (info) {
                            Sites.update(
                                {
                                    _id: req.body.site._id
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
                Sites.update(
                    {
                        _id: req.body.site._id
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
		_.assign(query, {
			"metadata.createdBy": {
				$regex: new RegExp(criteria.createdBy),
				$options: "i"
			}
		});
	}

	return query
};
