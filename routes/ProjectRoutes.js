const _ = require("lodash");
const mongoose = require("mongoose");
const Projects = mongoose.model("project");
const request = require('request-promise');

module.exports = app => {

    app.post("/projects/all", async (req, res) => {

        const query = Projects.find({
            "metadata.title": {
				$regex: new RegExp(req.body.title),
				$options: "i"
			}
        })

		return Promise.all(
			[query, Projects.countDocuments()]
		).then(
			results => {
				return res.json(results[0]);
			}
		);
	});

	// ===========================================================================

	app.post("/projects/search", async (req, res) => {
        const { criteria, sortProperty, offset, limit, order } = req.body;
        
		const query = Projects.find(buildQuery(criteria))
			.sort({ [sortProperty]: order })
			.skip(offset)
			.limit(limit);

		return Promise.all(
			[query, Projects.find(buildQuery(criteria)).countDocuments()]
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

	app.post("/projects/create", async (req, res) => {
		const Project = await new Projects({
			createdAt: new Date(),
            metadata: req.body.metadata,
		}).save();
		res.json(Project);
	});

	// ===========================================================================

	app.post("/projects/update", async (req, res) => {
		Projects.update(
			{
				_id: req.body.projectId
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
					Projects.findOne({ _id: req.body.projectId }, async (err, Project) => {
						if (Project) {
							res.json({ success: "true", info: info, project: Project });
						}
					});
				}
			}
		);
	});

	// ===========================================================================

	app.post("/projects/delete", async (req, res) => {
		Projects.remove({ _id: req.body.projectId }, async (err) => {
			if (err) return res.send(err);
			res.json({
				success: "true",
				message: "deleted Shape"
			});
		});
	});

	// ===========================================================================

	app.post("/projects/item", async (req, res) => {
		Projects.findOne({ _id: req.body.projectId }, async (err, Shape) => {
			if (Shape) {
				res.json(Shape);
			}
		});
    });

    // ===========================================================================

	app.post("/projects/main", async (req, res) => {
        
        const query = Projects.find({ "metadata.main": true })
			.sort({ "metadata.mainDate": -1 })
			.skip(0)
            .limit(1);
            
            return Promise.all(
                [query, Projects.find().countDocuments()]
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

	app.post("/projects/setMain", async (req, res) => {
        Projects.findOne({ "metadata.main": true }, async (err, project) => {
			if (project) {
                Projects.update(
                    {
                        _id: project._id
                    },
                    {
                        $set: { 
                            "metadata.main": false
                        }
                    },
                    async (err, info) => {
                        if (err) res.status(400).send({ error: "true", error: err });
                        if (info) {
                            Projects.update(
                                {
                                    _id: req.body.project._id
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
                Projects.update(
                    {
                        _id: req.body.project._id
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
