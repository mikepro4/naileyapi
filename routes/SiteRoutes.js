const _ = require("lodash");
const mongoose = require("mongoose");
const Sites = mongoose.model("site");
const Themes = mongoose.model("theme");
const Projects = mongoose.model("project");
const Pages = mongoose.model("page");
const request = require('request-promise');
const { pagespeedonline } = require("googleapis/build/src/apis/pagespeedonline");

module.exports = app => {

    // ===========================================================================

	app.post("/sites/all", async (req, res) => {
        
		const query = Sites.find({
            "metadata.title": {
				$regex: new RegExp(req.body.title),
				$options: "i"
			}
        })

		return Promise.all(
			[query, Sites.countDocuments()]
		).then(
			results => {
				return res.json(results[0]);
			}
		);
	});

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
        if(Site) {
            // db.col1.find({},{_id:0}).forEach(function(doc){db.col1.save(doc)});
            Pages.find({ "metadata.siteId" : req.body.originalId}, async (err, results) => {
				if (results.length > 0 && req.body.originalId) {
                    req.body.metadata.pages.forEach( async(page, i) => {

                        Pages.findOne({
                            _id: page.pageId
                        }, async(err, existingPage) => {

                            const NewPage = await new Pages({
                                createdAt: new Date(),
                                metadata: {
                                    ...existingPage.metadata,
                                    siteId: Site._id,
                                },
                            }).save();

                            if(NewPage) {
                                Sites.update(
                                    {
                                        _id: Site._id
                                    },
                                    {  $set: { "metadata.pages.$[element].pageId": NewPage._id }},
                                    {
                                        multi: true,
                                        arrayFilters: [ { "element.order": { $eq: i } } ]
                                    },
                                    async (err, result) => {
                                        if (result) {
                                            if(i == (req.body.metadata.pages.length - 1)) {
                                                res.json("ok")
                                            }
                                        } else if (err) {
                                            // console.log(err)
                                            // res.send(err);
                                        }
                                    }
                                );
                            }
                        })

                    })
                    
				} else {
                    const Page = await new Pages({
                        createdAt: new Date(),
                        "metadata.siteId": Site._id,
                        "metadata.home": true,
                        "metadata.title": "Home",
                        "metadata.url": "/"
                    }).save();
        
                    if(Page) {
                        Sites.update(
                            {
                                _id: Site._id
                            },
                            {
                                $push: {
                                    "metadata.pages": {
                                        pageId: Page._id,
                                        order: 0
                                    }
                                }
                            },
                            async (err, result) => {
                                if (result) {
                                    console.log(result)
                                    res.json(result);
                                } else if (err) {
                                    console.log(err)
                                    res.send(err);
                                }
                            }
                        );
                    }
                }
            })
            
           
        }
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
		Sites.findOne({ _id: req.body.siteId }, async (err, site) => {
			if (site) {
				res.json(site);
			}
		});
    });

    // ===========================================================================

	app.post("/sites/main", async (req, res) => {

        console.log(req.body.domain)

        Projects.findOne({ "metadata.domain": req.body.domain }, async (err, project) => {
            let criteria = {}
            let projectCriteria = {}

            if(project) {
                criteria = { "metadata.main": true, "metadata.projectId": project._id }
            } else {
                criteria = { "metadata.main": true}
            }

            if(project) {
                projectCriteria = { "_id": project._id }
            } else {
                projectCriteria = { "metadata.main": true}
            }

            const Site = await Sites.find(criteria)
                .sort({ "metadata.mainDate": -1 })
                .skip(0)
                .limit(1);

            if(Site) {
                const query2 = Themes.find({ "metadata.main": true })
                    .sort({ "metadata.mainDate": -1 })
                    .skip(0)
                    .limit(1);

                const query3 =  Projects.find(projectCriteria)
                    .sort({ "metadata.mainDate": -1 })
                    .skip(0)
                    .limit(1);

                const query4 =  Pages.find({"metadata.siteId" : Site[0]._id})

                return Promise.all(
                    [Sites.find({"metadata.projectId": req.body.projectId }).countDocuments(), Themes.find().countDocuments(), query2, query3, query4]
                ).then(
                    results => {
                        return res.json({
                            main: Site[0],
                            count: results[0],
                            themeCount: results[1],
                            theme: results[2][0],
                            project: results[3][0],
                            allPages: results[4]
                        })
                    }
                );
            }


            

        })

        // Sites.find({ "metadata.main": true }, async (err, site) => {
        //     if(site) {
        //             const query2 = Themes.find({ "metadata.main": true })
        //                 .sort({ "metadata.mainDate": -1 })
        //                 .skip(0)
        //                 .limit(1);

        //             const query3 =  Projects.find({ "_id": site.metadata.projectId })
        //                 .sort({ "metadata.mainDate": -1 })
        //                 .skip(0)
        //                 .limit(1);
        //     }
        // })
        
        // const query = Sites.find({ "metadata.main": true })
		// 	.sort({ "metadata.mainDate": -1 })
		// 	.skip(0)
        //     .limit(1);

    //     const query2 = Themes.find({ "metadata.main": true })
	// 		.sort({ "metadata.mainDate": -1 })
	// 		.skip(0)
    //         .limit(1);

    //     const query3 =  Projects.find({ "metadata.main": true })
    //         .sort({ "metadata.mainDate": -1 })
	// 		.skip(0)
    //         .limit(1);
            
    //     return Promise.all(
    //         [query, Sites.find().countDocuments(), Themes.find().countDocuments(), query2, query3]
    //     ).then(
    //         results => {
    //             return res.json({
    //                 main: results[0][0],
    //                 count: results[1],
    //                 themeCount: results[2],
    //                 theme: results[3][0],
    //                 project: results[4][0]
    //             })
    //         }
    //     );
    });
    
    // ===========================================================================

	app.post("/sites/setMain", async (req, res) => {
        Sites.findOne({ "metadata.main": true, "metadata.projectId": req.body.projectId}, async (err, site) => {
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
    
    if (criteria.projectId) {
		_.assign(query, {
			"metadata.projectId": {
				$eq: criteria.projectId
			}
		});
    }
    
	return query
};
