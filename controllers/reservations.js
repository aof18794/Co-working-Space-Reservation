const Reservation = require('../models/Reservation');
const CoworkingSpace = require('../models/CoworkingSpace');

// Get all reservations
// route GET /api/v1/reservations
// route GET /api/v1/coworking/:name/reservations
// access Private
exports.getReservations = async (req, res, next) => {
	let query;

	if (req.user.role !== 'admin') {
		query = Reservation.find({ user: req.user.id }).populate({
			path: 'coworking',
			select: 'name address tel openTime closeTime',
		});
	} else {
		query = Reservation.find().populate({
			path: 'coworking',
			select: 'name address tel openTime closeTime',
		});
	}

	try {
		const reservations = await query;

		res.status(200).json({
			success: true,
			count: reservations.length,
			data: reservations,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: 'Cannot find Reservation',
		});
	}
};

// Get one reservation
// route GET /api/v1/reservations/:id
// access Public
exports.getReservation = async (req, res, next) => {
	try {
		const reservation = await Reservation.findById(req.params.id).populate({
			path: 'coworking',
			select: 'name address tel openTime closeTime',
		});

		if (!reservation) {
			return res.status(404).json({
				success: false,
				message: `No reservation with the id of ${req.params.id}`,
			});
		}

		res.status(200).json({ success: true, data: reservation });
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: 'Cannot find Reservation' });
	}
};

// Add one reservation
// route POST /api/v1/coworkings/:name/reservations/
// access Private
exports.addReservation = async (req, res, next) => {
	try {
		req.body.coworking = req.params.name;

		req.body.user = req.user.id;

		console.log(req.params);
		console.log(req.user.id);

		const existedReservation = await Reservation.find({ user: req.user.id });

		if (existedReservation.length >= 3 && req.user.role !== 'admin') {
			return res.status(400).json({
				success: false,
				message: `The user with ID ${req.user.id} has already made 3 reservations`,
			});
		}

		console.log(existedReservation);

		// Check existed coworking space
		const coworkingName = req.params.name;
		const coworking = await CoworkingSpace.findOne({ name: coworkingName });

		// console.log(coworkingName);
		// console.log(coworkingName);
		// console.log(coworkingName);
		// console.log(coworking);

		if (!coworking) {
			return res.status(404).json({
				success: false,
				message: `No coworking with ${req.params.name} `,
			});
		}

		const reservation = await Reservation.create(req.body);
		res.status(200).json({ success: true, data: reservation });
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: 'Cannnot create Reservation' });
	}
};

// Update reservation
// route PUT /api/v1/reservations/:id
// access Private
exports.updateReservation = async (req, res, next) => {
	try {
		let reservation = await Reservation.findById(req.params.id);

		if (!reservation) {
			return res.status(404).json({
				success: false,
				message: `Cannot find any reservation with ID ${req.params.id}`,
			});
		}
		if (
			reservation.user.toString() !== req.user.id &&
			req.user.role !== 'admin'
		) {
			return res.status(401).json({
				success: false,
				message: `User ${req.user.id} is not authorized to update this reservation`,
			});
		}

		reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		res.status(200).json({
			success: true,
			data: reservation,
			message: 'Update successfully',
		});
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: 'Cannnot update Reservation' });
	}
};

// Delete one reservation
// route DELETE /api/v1/reservations/:id
// access Private
exports.deleteReservation = async (req, res, next) => {
	try {
		const reservation = await Reservation.findById(req.params.id);

		// Check existed reservation
		if (!reservation) {
			return res.status(404).json({
				success: false,
				message: `Cannot find any reservation with ID ${req.params.id}`,
			});
		}

		// Check role for accessing this reservation
		if (
			reservation.user.toString() !== req.user.id &&
			reservation.user.role !== 'admin'
		) {
			return res.status(401).json({
				success: false,
				message: `User ${req.user.id} is not authorized to update this reservation`,
			});
		}

		await reservation.remove();

		res
			.status(200)
			.json({ success: true, message: 'Remove successfully', data: {} });
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: 'Cannnot delete Reservation' });
	}
};
