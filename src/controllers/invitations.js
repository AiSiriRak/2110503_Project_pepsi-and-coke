const User = require('../models/User');
const CoworkingSpace = require('../models/CoworkingSpace');
const Reservation = require('../models/Reservation');
const Invitation = require('../models/Invitation');
const { ErrorResponse, MSG } = require('../utils/error');

// @desc    Get all invitations
// @route   GET /api/v1/invitations
// @route   GET /api/v1/reservations/:reservationId/invitations
// @access  Private
exports.getInvitations = async (req, res, next) => {
    try {
        let query;
        const filter = {};

        // If nested under a specific reservation
        if (req.params.reservationId) {
            filter.reservation = req.params.reservationId;

            const reservation = await Reservation.findById(
                req.params.reservationId,
            );
            if (!reservation) {
                return next(
                    new ErrorResponse(
                        MSG.RESERVATION_NOT_FOUND(req.params.reservationId),
                        404,
                    ),
                );
            }

            // General users only see invitations meant for them unless they are the host or admin
            if (
                reservation.user.toString() !== req.user.id &&
                req.user.role !== 'admin'
            ) {
                filter.recipient = req.user.id;
            }
        } else if (req.user.role !== 'admin') {
            // Standalone route: users see invitations where they are inviter OR recipient
            filter.$or = [{ recipient: req.user.id }, { inviter: req.user.id }];
        }

        // Build query with populate
        query = Invitation.find(filter)
            .populate('inviter', 'name email')
            .populate('recipient', 'name email')
            .populate({
                path: 'reservation',
                select: 'reserveDate user coworkingSpace',
                populate: {
                    path: 'coworkingSpace',
                    select: 'name address telephoneNumber openTime closeTime',
                },
            });

        // Executing query
        const invitation = await query;

        res.status(200).json({
            success: true,
            count: invitation.length,
            data: invitation,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single invitation
// @route   GET /api/v1/invitations/:id
// @access  Private
exports.getInvitation = async (req, res, next) => {
    try {
        // Find Invitation by ID
        const invitation = await Invitation.findById(req.params.id)
            .populate('inviter', 'name email')
            .populate('recipient', 'name email')
            .populate({
                path: 'reservation',
                select: 'reserveDate user coworkingSpace',
                populate: {
                    path: 'coworkingSpace',
                    select: 'name address telephoneNumber openTime closeTime',
                },
            });

        // Invitation with the ID not found
        if (!invitation) {
            return next(
                new ErrorResponse(MSG.INVITATION_NOT_FOUND(req.params.id), 404),
            );
        }

        // Check if user is host/recipient/admin
        const isRecipient = invitation.recipient._id.toString() === req.user.id;
        const isInviter = invitation.inviter._id.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isRecipient && !isInviter && !isAdmin) {
            return next(new ErrorResponse(MSG.NOT_RESOURCE_OWNER, 403));
        }

        res.status(200).json({
            success: true,
            data: invitation,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create an invitation
// @route   POST /api/v1/reservations/:reservationId/invitations
// @access  Private
exports.createInvitation = async (req, res, next) => {
    try {
        const { reservationId } = req.params;
        const { email } = req.body;

        // Validate request body
        if (!email) {
            return next(new ErrorResponse(MSG.MISSING_COBOOKER_EMAIL, 400));
        }

        // Find recipient
        const recipient = await User.findOne({ email: email.toLowerCase() });
        if (!recipient) {
            return next(new ErrorResponse(MSG.USER_NOT_FOUND, 404));
        }

        // Find reservation
        const reservation = await Reservation.findById(reservationId);
        if (!reservation)
            return next(
                new ErrorResponse(
                    MSG.RESERVATION_NOT_FOUND(reservationId),
                    404,
                ),
            );

        // Check resource owner / admin
        if (
            reservation.user.toString() !== req.user.id &&
            req.user.role !== 'admin'
        ) {
            return next(new ErrorResponse(MSG.NOT_RESOURCE_OWNER, 403));
        }

        // Prevent self-invitation
        if (recipient._id.toString() === req.user.id) {
            return next(new ErrorResponse(MSG.SELF_INVITATION, 400));
        }

        // Prevent inviting someone who is already an accepted co-booker
        if (
            reservation.cobooker.some(
                (id) => id.toString() === recipient._id.toString(),
            )
        ) {
            return next(new ErrorResponse(MSG.USER_ALREADY_INVITED, 400));
        }

        const invitation = await Invitation.create({
            reservation: reservationId,
            inviter: req.user.id,
            recipient: recipient._id,
            status: 'pending',
        });

        // TODO: Add line trigger message for create here

        res.status(201).json({
            success: true,
            data: invitation,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Respond to an invitation (Accept/Decline)
// @route   PUT /api/v1/invitations/:id
// @access  Private
exports.respondInvitation = async (req, res, next) => {
    try {
        const { status } = req.body;

        // Validate status input
        if (!['accepted', 'declined'].includes(status)) {
            return next(new ErrorResponse(MSG.INVALID_STATUS, 400));
        }

        const invitation = await Invitation.findById(req.params.id);

        // Check if invitation exist
        if (!invitation) {
            return next(
                new ErrorResponse(MSG.INVITATION_NOT_FOUND(req.params.id), 404),
            );
        }

        // Only recipient can respond
        if (invitation.recipient.toString() !== req.user.id) {
            return next(new ErrorResponse(MSG.NOT_RESOURCE_OWNER, 403));
        }

        // Check if it's an active invitation
        if (invitation.status !== 'pending') {
            return next(
                new ErrorResponse(
                    MSG.INVITATION_INACTIVE(invitation.status),
                    400,
                ),
            );
        }

        // If accept, check limit and add user id into reservation's cobooker
        if (status === 'accepted') {
            // Check if user has already maximize reserve limit
            if (req.user.role !== 'admin') {
                const activeReservationsCount =
                    await Reservation.countDocuments({
                        $or: [{ user: req.user.id }, { cobooker: req.user.id }],
                    });

                if (activeReservationsCount >= 3) {
                    return next(
                        new ErrorResponse(
                            MSG.RESERVATION_LIMIT(req.user.id),
                            400,
                        ),
                    );
                }
            }

            // Validate reservation
            const reservation = await Reservation.findById(
                invitation.reservation,
            );
            if (!reservation) {
                return next(
                    new ErrorResponse(
                        MSG.RESERVATION_NOT_FOUND(invitation.reservation),
                        404,
                    ),
                );
            }

            // Validate co-working space
            const coworkingSpace = await CoworkingSpace.findById(
                reservation.coworkingSpace,
            );
            if (!coworkingSpace) {
                return next(
                    new ErrorResponse(
                        MSG.COWORKING_SPACE_NOT_FOUND(
                            reservation.coworkingSpace,
                        ),
                        404,
                    ),
                );
            }

            // Check Co-working Space's capacity and Reservation's
            if (
                reservation.cobooker.length + 1 >=
                coworkingSpace.maximumCapacity
            ) {
                return next(
                    new ErrorResponse(
                        MSG.INVITATION_LIMIT_RESERVATION(
                            reservation._id,
                            coworkingSpace.maximumCapacity,
                        ),
                        400,
                    ),
                );
            }

            await Reservation.findByIdAndUpdate(reservation._id, {
                $addToSet: { cobooker: req.user.id },
            });
        }

        // Update status
        invitation.status = status;
        await invitation.save();

        // TODO: Trigger LINE notification to host regarding accept/decline action

        res.status(200).json({
            success: true,
            data: invitation,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete invitation
// @route   DELETE  /api/v1/invitations/:id
// @access  Private
exports.deleteInvitation = async (req, res, next) => {
    try {
        // Find Invitation by ID
        const invitation = await Invitation.findById(req.params.id);

        // Invitation with the ID not found
        if (!invitation) {
            return next(
                new ErrorResponse(MSG.INVITATION_NOT_FOUND(req.params.id), 404),
            );
        }

        // Check if user is host/recipient/admin
        const isRecipient = invitation.recipient.toString() === req.user.id;
        const isInviter = invitation.inviter.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isRecipient && !isInviter && !isAdmin) {
            return next(new ErrorResponse(MSG.NOT_RESOURCE_OWNER, 403));
        }

        // Clean up cobooker array if the deleted invitation was accepted
        if (invitation.status === 'accepted') {
            await Reservation.findByIdAndUpdate(invitation.reservation, {
                $pull: { cobooker: invitation.recipient },
            });
        }

        await invitation.deleteOne();

        res.status(200).json({
            success: true,
            data: {},
        });
    } catch (error) {
        next(error);
    }
};
