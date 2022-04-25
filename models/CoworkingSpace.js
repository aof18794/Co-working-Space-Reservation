const mongoose = require('mongoose');

const CoworkingSpaceSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Please add a name'],
			unique: true,
			trim: true,
			index: true,
			maxlength: [50, 'Name can not be more than 50 characters'],
		},
		address: {
			type: String,
			required: [true, 'Please add an address'],
		},
		opentime: {
			type: String,
			required: [true, 'Please specify the open time'],
			match: [/[0-1]*\d:[0-5]\d [apAP][mM]/, 'Invalid time format'],
		},
		closetime: {
			type: String,
			required: [true, 'Please specify the close time'],
			match: [/[0-1]*\d:[0-5]\d [apAP][mM]/, 'Invalid time format'],
		},
		tel: {
			type: String,
		},
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

//Cascade delete appointments when a hospital is deleted
CoworkingSpaceSchema.pre('remove', async function (next) {
	console.log(`Reservations being removed from co-working space ${this.name}`);
	await this.model('Reservation').deleteMany({ coworking: this.name });
	next();
});

//Reverse populate with virtuals
CoworkingSpaceSchema.virtual('reservations', {
	ref: 'Reservation', // ref to Appointment Schema
	localField: 'name',
	foreignField: 'coworking',
	justOne: false,
});

module.exports = mongoose.model('CoworkingSpace', CoworkingSpaceSchema);
