const _ = require("lodash");
const mongoose = require("mongoose");
const Pages = mongoose.model("page");
const request = require('request-promise');

module.exports = app => {

    app.post("/pages/all", async (req, res) => {

        const query = Pages.find({
            "metadata.title": {
				$regex: new RegExp(req.body.title),
				$options: "i"
			}
        })

		return Promise.all(
			[query, Pages.countDocuments()]
		).then(
			results => {
				return res.json(results[0]);
			}
		);
	});

	// ===========================================================================

	app.post("/pages/search", async (req, res) => {
        const { criteria, sortProperty, offset, limit, order } = req.body;
        
		const query = Pages.find(buildQuery(criteria))
			.sort({ [sortProperty]: order })
			.skip(offset)
			.limit(limit);

		return Promise.all(
			[query, Pages.find(buildQuery(criteria)).countDocuments()]
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

	app.post("/pages/create", async (req, res) => {
		const Page = await new Pages({
			createdAt: new Date(),
            metadata: req.body.metadata,
		}).save();
		res.json(Page);
	});

	// ===========================================================================

	app.post("/pages/update", async (req, res) => {
		Pages.update(
			{
				_id: req.body.pageId
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
					Pages.findOne({ _id: req.body.pageId }, async (err, Page) => {
						if (Page) {
							res.json({ success: "true", info: info, page: Page });
						}
					});
				}
			}
		);
	});

	// ===========================================================================

	app.post("/pages/delete", async (req, res) => {
		Pages.remove({ _id: req.body.pageId }, async (err) => {
			if (err) return res.send(err);
			res.json({
				success: "true",
				message: "deleted Shape"
			});
		});
	});

	// ===========================================================================

	app.post("/pages/item", async (req, res) => {
		Pages.findOne({ _id: req.body.pageId }, async (err, Shape) => {
			if (Shape) {
				res.json(Shape);
			}
		});
    });

    // ===========================================================================

	app.post("/pages/main", async (req, res) => {
        
        const query = Pages.find({ "metadata.main": true })
			.sort({ "metadata.mainDate": -1 })
			.skip(0)
            .limit(1);
            
            return Promise.all(
                [query, Pages.find().countDocuments()]
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

	app.post("/pages/setMain", async (req, res) => {
        Pages.findOne({ "metadata.main": true }, async (err, page) => {
			if (page) {
                Pages.update(
                    {
                        _id: page._id
                    },
                    {
                        $set: { 
                            "metadata.main": false
                        }
                    },
                    async (err, info) => {
                        if (err) res.status(400).send({ error: "true", error: err });
                        if (info) {
                            Pages.update(
                                {
                                    _id: req.body.page._id
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
                Pages.update(
                    {
                        _id: req.body.page._id
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
