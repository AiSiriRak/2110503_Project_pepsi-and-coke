const CoworkingSpace = require('../models/CoworkingSpace');
const Reservation = require('../models/Reservation');
const { ErrorResponse, MSG } = require('../utils/error');

// @desc       Get all reservations
// @route      GET /api/v1/reservations
// @access     Public
exports.getReservations = async (req, res, next) => {
    let query;

    if (req.user.role !== 'admin') {
        // General users can see only their reservations
        query = Reservation.find({
            $or: [{ user: req.user.id }, { cobooker: req.user.id }],
        }).populate({
            path: 'coworkingSpace',
            select: 'name address telephoneNumber openTime closeTime maximumCapacity',
        });
    } else {
        // Admin can see all reservations
        if (req.params.CoworkingSpaceId) {
            query = Reservation.find({
                CoworkingSpace: req.params.coworkingSpaceId,
            }).populate({
                path: 'coworkingSpace',
                select: 'name address telephoneNumber openTime closeTime maximumCapacity',
            });
        } else
            query = Reservation.find().populate({
                path: 'coworkingSpace',
                select: 'name address telephoneNumber openTime closeTime maximumCapacity',
            });
    }

    try {
        // Executing query
        const reservation = await query;
        res.status(200).json({
            success: true,
            count: reservation.length,
            data: reservation,
        });
    } catch (error) {
        next(error);
    }
};

// @desc       Get single reservation
// @route      GET /api/v1/reservations/:id
// @access     Public
exports.getReservation = async (req, res, next) => {
    try {
        // Find Reservation by ID
        const reservation = await Reservation.findById(req.params.id);

        // Check if user is owner/co-booker/admin
        if (
            !reservation.user.toString() === req.user.id &&
            !reservation.cobooker.some(
                (userId) => userId.toString() === req.user.id,
            ) &&
            !req.user.role === 'admin'
        )
            return next(new ErrorResponse(MSG.NOT_AUTHORIZED, 401));

        // Reservation with the ID not found
        if (!reservation) {
            return next(
                new ErrorResponse(
                    MSG.RESERVATION_NOT_FOUND(req.params.id),
                    404,
                ),
            );
        }

        // Found Reservation
        res.status(200).json({
            success: true,
            data: reservation,
        });
    } catch (error) {
        next(error);
    }
};

// @desc       Create a reservation
// @route      POST  /api/v1/coworking-spaces/:coworkingSpaceId/reservations
// @access     Private
exports.createReservation = async (req, res, next) => {
    try {
        req.body.coworkingSpace = req.params.coworkingSpaceId;

        const coworkingSpace = await CoworkingSpace.findById(
            req.params.coworkingSpaceId,
        );

        if (!coworkingSpace)
            return next(
                new ErrorResponse(
                    MSG.COWORKING_SPACE_NOT_FOUND(req.params.coworkingSpaceId),
                    404,
                ),
            );

        // Add user Id to req.body
        req.body.user = req.user.id;

        // Check for existed appointment
        const existedReservations = await Reservation.find({
            user: req.user.id,
        });

        // If the user is not an admin, they can only create 3 appointment.
        if (existedReservations.length >= 3 && req.user.role !== 'admin')
            return next(
                new ErrorResponse(MSG.RESERVATION_LIMIT(req.user.id), 400),
            );

        const reservation = await Reservation.create(req.body);

        res.status(201).json({ success: true, data: reservation });
    } catch (error) {
        next(error);
    }
};

// @desc       Update reservation
// @route      PUT  /api/v1/reservations/:id
// @access     Private
exports.updateResrvation = async (req, res, next) => {
    try {
        let reservation = await Reservation.findById(req.params.id);

        if (!reservation)
            return next(
                new ErrorResponse(
                    MSG.RESERVATION_NOT_FOUND(req.params.id),
                    404,
                ),
            );

        // Make sure user is the appointment owner
        if (
            reservation.user.toString() !== req.user.id &&
            req.user.role !== 'admin'
        )
            return next(new ErrorResponse(MSG.NOT_AUTHORIZED, 401));

        reservation = await Reservation.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            },
        );

        res.status(200).json({ success: true, data: reservation });
    } catch (error) {
        next(error);
    }
};

// @desc       Delete reservation
// @route      DELETE  /api/v1/reservations/:id
// @access     Private
exports.deleteReservation = async (req, res, next) => {
    try {
        const reservation = await Reservation.findById(req.params.id);

        if (!reservation)
            return next(
                new ErrorResponse(
                    MSG.RESERVATION_NOT_FOUND(req.params.id),
                    404,
                ),
            );

        // Make sure user is the reservation owner
        if (
            reservation.user.toString() !== req.user.id &&
            req.user.role !== 'admin'
        ) {
            return next(new ErrorResponse(MSG.NOT_AUTHORIZED, 401));
        }

        await reservation.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};
