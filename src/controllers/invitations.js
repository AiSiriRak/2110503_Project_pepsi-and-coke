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
        const { userId } = req.body;

        // Check if Reservation ID is valid
        const reservation = await Reservation.findById(reservationId);
        if (!reservation)
            return next(
                new ErrorResponse(
                    MSG.RESERVATION_NOT_FOUND(req.params.reservationId),
                    404,
                ),
            );

        // Check if the inviter is owner of the reservation
        if (
            reservation.user.toString() !== req.user.id &&
            req.user.role !== 'admin'
        ) {
            return next(new ErrorResponse(MSG.NOT_RESOURCE_OWNER, 403));
        }

        // Prevent self-invitation
        if (userId === req.user.id) {
            return next(new ErrorResponse('You cannot invite yourself', 400));
        }

        // Check if the target user is valid
        const targetUser = await User.findById(userId);
        if (!targetUser) {
            return next(new ErrorResponse(MSG.USER_NOT_FOUND, 404));
        }

        // Prevent inviting already cobooker
        if (reservation.cobooker.some((id) => id.toString() === userId)) {
            return next(new ErrorResponse(MSG.USER_ALREADY_INVITED, 400));
        }

        // Check for active invitations
        const activeStatus = 'pending';
        const existingInvitations = await Invitation.find({
            recipient: userId,
            status: activeStatus,
        });

        // If the invited user is not an admin, they can only have 3 pending invitation.
        if (existingInvitations.length >= 3 && targetUser.role !== 'admin') {
            return next(
                new ErrorResponse(MSG.INVITATION_LIMIT_USER(userId), 400),
            );
        }

        // Check Space Capacity limit
        const coworkingSpace = await CoworkingSpace.findById(
            reservation.coworkingSpace,
        );

        if (!coworkingSpace)
            return next(
                new ErrorResponse(
                    MSG.COWORKING_SPACE_NOT_FOUND(reservation.coworkingSpace),
                    404,
                ),
            );

        // Total occupied = 1 (Host) + current accepted cobookers
        const totalConfirmed = 1 + reservation.cobooker.length;
        const remainingCapacity =
            coworkingSpace.maximumCapacity - totalConfirmed;

        const activeInvitations = await Invitation.find({
            reservation: reservationId,
            status: activeStatus,
        });

        if (activeInvitations.length >= remainingCapacity) {
            return next(
                new ErrorResponse(
                    MSG.INVITATION_LIMIT_RESERVATION(
                        reservationId,
                        coworkingSpace.maximumCapacity,
                    ),
                ),
                400,
            );
        }

        const invitation = await Invitation.create({
            reservation: reservationId,
            inviter: req.user.id,
            recipient: userId,
            status: activeStatus,
        });

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

        let invitation = await Invitation.findById(req.params.id);

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

        // Update status
        invitation.status = status;
        await invitation.save();

        // If accept, add user id into reservation's cobooker
        if (status === 'accepted') {
            await Reservation.findByIdAndUpdate(invitation.reservation, {
                $addToSet: { cobooker: req.user.id },
            });
        }

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
