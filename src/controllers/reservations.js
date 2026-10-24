const CoworkingSpace = require('../models/CoworkingSpace');
const Reservation = require('../models/Reservation');
const Invitation = require('../models/Invitation');
const { ErrorResponse, MSG } = require('../utils/error');

// @desc    Get all reservations
// @route   GET /api/v1/reservations
// @route   GET /api/v1/coworkingspaces/:coworkingSpaceId/reservations
// @access  Private
exports.getReservations = async (req, res, next) => {
    try {
        const filter = {};

        // Filter by coworking space if nested route is used (applies to ALL roles)
        if (req.params.coworkingSpaceId) {
            filter.coworkingSpace = req.params.coworkingSpaceId;
        }

        // Non-admins can only see reservations they own or co-booked
        if (req.user.role !== 'admin') {
            filter.$or = [{ user: req.user.id }, { cobooker: req.user.id }];
        }

        // Executing query with filter
        const reservations = await Reservation.find(filter).populate({
            path: 'coworkingSpace',
            select: 'name address telephoneNumber openTime closeTime maximumCapacity',
        });

        res.status(200).json({
            success: true,
            count: reservations.length,
            data: reservations,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single reservation
// @route   GET /api/v1/reservations/:id
// @access  Private
exports.getReservation = async (req, res, next) => {
    try {
        // Find Reservation by ID
        const reservation = await Reservation.findById(req.params.id).populate({
            path: 'coworkingSpace',
            select: 'name address telephoneNumber openTime closeTime maximumCapacity',
        });

        // Reservation with the ID not found
        if (!reservation) {
            return next(
                new ErrorResponse(
                    MSG.RESERVATION_NOT_FOUND(req.params.id),
                    404,
                ),
            );
        }

        // 3. Check if user is owner/co-booker/admin
        const isOwner = reservation.user.toString() === req.user.id;
        const isCobooker = reservation.cobooker.some(
            (userId) => userId.toString() === req.user.id,
        );
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isCobooker && !isAdmin) {
            return next(new ErrorResponse(MSG.NOT_RESOURCE_OWNER, 403));
        }

        // Fetch associated invitations
        const invitationFilter = { reservation: req.params.id };

        // Hosts and admins see all invitations; co-bookers see only invitations meant for them
        if (!isOwner && !isAdmin) {
            invitationFilter.recipient = req.user.id;
        }

        const invitations = await Invitation.find(invitationFilter)
            .populate('inviter', 'name email')
            .populate('recipient', 'name email');

        // Found Reservation
        res.status(200).json({
            success: true,
            data: {
                ...reservation.toObject(),
                invitations,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a reservation
// @route   POST /api/v1/coworking-spaces/:coworkingSpaceId/reservations
// @access  Private
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

        // Check for existed reservation
        const existedReservations = await Reservation.find({
            user: req.user.id,
        });

        // If the user is not an admin, they can only create 3 appointment.
        if (existedReservations.length >= 3 && req.user.role !== 'admin')
            return next(
                new ErrorResponse(MSG.RESERVATION_LIMIT(req.user.id), 400),
            );

        const reservation = await Reservation.create(req.body);

        res.status(201).json({
            success: true,
            data: reservation,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update reservation
// @route   PUT /api/v1/reservations/:id
// @access  Private
exports.updateReservation = async (req, res, next) => {
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
            return next(new ErrorResponse(MSG.NOT_RESOURCE_OWNER, 403));

        reservation = await Reservation.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            },
        );

        res.status(200).json({
            success: true,
            data: reservation,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete reservation
// @route   DELETE  /api/v1/reservations/:id
// @access  Private
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
            return next(new ErrorResponse(MSG.NOT_RESOURCE_OWNER, 403));
        }

        // Cascade delete all invitations related to this reservation
        await Invitation.deleteMany({
            reservation: req.params.id,
        });

        // Delete Reservation
        await reservation.deleteOne();

        res.status(200).json({
            success: true,
            data: {},
        });
    } catch (error) {
        next(error);
    }
};
