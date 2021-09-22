const _ = require("lodash");
const mongoose = require("mongoose");
const Products = mongoose.model("product");

module.exports = app => {

	// ===========================================================================

	app.post("/products/search", async (req, res) => {
        const { criteria, sortProperty, offset, limit, order } = req.body;
        
		const query = Products.find(buildQuery(criteria))
			.sort({ [sortProperty]: order })
			.skip(offset)
			.limit(limit);

		return Promise.all(
			[query, Products.find(buildQuery(criteria)).countDocuments()]
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

	app.post("/products/create", async (req, res) => {
		const Product = await new Products({
			createdAt: new Date(),
            metadata: req.body.metadata,
		}).save();
		res.json(Product);
	});

	// ===========================================================================

	app.post("/products/update", async (req, res) => {
		Products.update(
			{
				_id: req.body.productId
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
					Products.findOne({ _id: req.body.productId }, async (err, Product) => {
						if (Product) {
							res.json({ success: "true", info: info, product: Product });
						}
					});
				}
			}
		);
	});

	// ===========================================================================

	app.post("/products/delete", async (req, res) => {
		Products.remove({ _id: req.body.productId }, async (err) => {
			if (err) return res.send(err);
			res.json({
				success: "true",
			});
		});
	});

	// ===========================================================================

	app.post("/products/item", async (req, res) => {
		Products.findOne({ _id: req.body.productId }, async (err, Shape) => {
			if (Shape) {
				res.json(Shape);
			}
		});
    });

    // ===========================================================================

	app.post("/products/main", async (req, res) => {
        
        const query = Products.find({ "metadata.main": true })
			.sort({ "metadata.mainDate": -1 })
			.skip(0)
            .limit(1);
            
            return Promise.all(
                [query, Products.find().countDocuments()]
            ).then(
                results => {
                    return res.json({
                        main: results[0][0]
                    })
                }
            );
    });
    
    // ===========================================================================

	app.post("/products/setMain", async (req, res) => {
        Products.findOne({ "metadata.main": true }, async (err, product) => {
			if (product) {
                Products.update(
                    {
                        _id: product._id
                    },
                    {
                        $set: { 
                            "metadata.main": false
                        }
                    },
                    async (err, info) => {
                        if (err) res.status(400).send({ error: "true", error: err });
                        if (info) {
                            Products.update(
                                {
                                    _id: req.body.product._id
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
                Products.update(
                    {
                        _id: req.body.product._id
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
