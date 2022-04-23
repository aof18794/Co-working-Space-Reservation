const CoworkingSpace = require('../models/CoworkingSpace');

//@desc     Get all co-working space
//@route    GET /api/v1/coworkings
//@accress  Public
exports.getCoworkingSpaces = async (req, res, next) => {
	let query;

	//Copy req.query data
	const reqQuery = { ...req.query };

	//Fields to exclude
	const removeFields = ['select', 'sort', 'page', 'limit'];

	//Loop over remove fields and delete them from reqQuery
	removeFields.forEach(param => delete reqQuery[param]);
	console.log(reqQuery);

	let queryStr = JSON.stringify(reqQuery);
	queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

	query = CoworkingSpace.find(JSON.parse(queryStr)).populate('reservations');

	// Select Fields
	if (req.query.select) {
		const fields = req.query.select.split(',').join(' ');
		query = query.select(fields);
	}

	//Sort
	if (req.query.sort) {
		const sortBy = req.query.sort.split(',').join(' ');
		query = query.sort(sortBy);
	} else {
		query = query.sort('-createAt');
	}

	//Pagination
	const page = parseInt(req.query.page, 10) || 1;
	const limit = parseInt(req.query.limit, 10) || 25; // the number of documents in each page
	const startIndex = (page - 1) * limit; // start from 0 and then step by limit
	const endIndex = page * limit;
	const total = await CoworkingSpace.countDocuments();

	query = query.skip(startIndex).limit(limit);

	//Executing query
	try {
		const coworking = await query;
		//console.log(req.query);

		//Pagination result
		const pagination = {};

		if (endIndex < total) {
			pagination.next = {
				page: page + 1,
				limit,
			};
		}

		if (startIndex > 0) {
			pagination.prev = {
				page: page - 1,
				limit,
			};
		}

		res.status(200).json({
			success: true,
			count: coworking.length,
			pagination,
			data: coworking,
		});
	} catch (err) {
		res.status(400).json({ success: false });
	}
};

//@desc     Get single co-working space
//@route    GET /api/v1/coworkings/:id
//@accress  Public
exports.getCoworkingSpace = async (req, res, next) => {
	try {
		const coworking = await CoworkingSpace.findById(req.params.id).populate(
			'reservations'
		);

		if (!coworking) {
			return res.status(400).json({ success: false });
		}
		res.status(200).json({ success: true, data: coworking });
	} catch (err) {
		res.status(400).json({ success: false });
	}
};

//@desc     Create new co-working space
//@route    POST /api/v1/coworkings
//@accress  Private, Admin
exports.createCoworkingSpace = async (req, res, next) => {
	try {
		const coworking = await CoworkingSpace.create(req.body);
		res.status(201).json({
			success: true,
			data: coworking,
		});
	} catch (err) {
		res.status(500).json({ message: err.message, success: false });
	}
};

//@desc     Update co-working space
//@route    PUT /api/v1/coworkings/:id
//@accress  Private, Admin
exports.updateCoworkingSpace = async (req, res, next) => {
	try {
		const coworking = await CoworkingSpace.findByIdAndUpdate(
			req.params.id,
			req.body,
			{
				new: true,
				runValidators: true,
			}
		);

		if (!coworking) {
			return res.status(400).json({ success: false });
		}

		res.status(200).json({ success: true, data: coworking });
	} catch (err) {
		res.status(400).json({ success: false });
	}
};

//@desc     Delete co-working space
//@route    DELETE /api/v1/coworkings/:id
//@accress  Private, Admin
exports.deleteCoworkingSpace = async (req, res, next) => {
	try {
		const coworking = await CoworkingSpace.findById(req.params.id);

		if (!coworking) {
			return res.status(400).json({ success: false });
		}

		coworking.remove();
		res.status(200).json({ success: true, data: {} });
	} catch (err) {
		res.status(400).json({ success: false });
	}
};
