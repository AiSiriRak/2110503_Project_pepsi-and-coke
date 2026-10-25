const crypto = require('crypto');
const User = require('../models/User');
const {
    replyText,
    reminderBubble,
    ADD_LINE_LINK,
    inviteBubble,
    reservationBubble,
} = require('../utils/line');

// @route   POST /api/v1/line/link-code
// @access  Private
exports.createLinkCode = async (req, res, next) => {
    try {
        const code = crypto.randomInt(100000, 1000000).toString();
        await User.updateOne(
            { _id: req.user.id },
            {
                lineLinkCode: code,
                lineLinkCodeExpire: new Date(Date.now() + 10 * 60 * 1000),
            },
        );
        res.status(200).json({ success: true, code, expiresInMinutes: 10 });
    } catch (error) {
        next(error);
    }
};

const handleEvent = async (event) => {
    console.log(event);

    // If user blocked/unfollowed the OA: forget the link
    if (event.type === 'unfollow') {
        return User.updateOne(
            { lineUserId: event.source.userId },
            { $unset: { lineUserId: '' } },
        );
    }

    // Ignore non-text messages
    if (event.type !== 'message' || event.message.type !== 'text') return;

    // Check whether this LINE account is already linked
    const lineUserId = event.source.userId;
    const linkedUser = await User.findOne({ lineUserId });

    // *********** FOR TESTING ONLY ************* //
    // Send reminder to user
    const testCowork = {
        name: 'Co name Test',
        address: '67/67, next world province, 00000',
        telephoneNumber: '123-456-7890',
        openTime: '08:00',
        closeTime: '16.00',
        maximumCapacity: 3,
    };
    const testReserv = {
        reserveDate: '2022-01-01',
    };
    if (/^test reminder$/i.test(event.message.text.trim()))
        return reminderBubble(event.replyToken, testCowork, testReserv, 3);
    if (/^test invite$/i.test(event.message.text.trim()))
        return inviteBubble(
            event.replyToken,
            testCowork,
            testReserv,
            'test user',
        );
    if (/^test reserv$/i.test(event.message.text.trim()))
        return reservationBubble(
            event.replyToken,
            testCowork,
            testReserv,
            'created',
        );
    // ****************************************** //

    // If user already linked Line account
    if (linkedUser) {
        return replyText(
            event.replyToken,
            'Your LINE account is already linked to your account.',
        );
    }

    // If user send msg start with link
    const match = event.message.text.trim().match(/^link\s+(\d{6})$/i);
    if (!match) {
        return replyText(
            event.replyToken,
            'To link your account with line, press get link from your profile then type "link {your 6 digits code}"\nex.   link 123456',
        );
    }

    const user = await User.findOneAndUpdate(
        { lineLinkCode: match[1], lineLinkCodeExpire: { $gt: new Date() } },
        {
            lineUserId: event.source.userId,
            $unset: { lineLinkCode: '', lineLinkCodeExpire: '' },
        },
    );

    return replyText(
        event.replyToken,
        user
            ? 'Account linked successfully.'
            : 'Invalid code or Expired code, please try again.',
    );
};

// @route   POST /api/v1/line/webhook
exports.handleWebhook = async (req, res) => {
    try {
        await Promise.all(req.body.events.map(handleEvent));
        res.sendStatus(200);
    } catch (error) {
        console.error(error.stack);
        res.sendStatus(500);
    }
};

exports.getAddLineLink = async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            link: ADD_LINE_LINK,
        });
    } catch (error) {
        next(error);
    }
};
