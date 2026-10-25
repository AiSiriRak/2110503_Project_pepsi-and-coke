const line = require('@line/bot-sdk');

const ADD_LINE_LINK = 'https://lin.ee/Qp3cqaj';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

let client;
const getClient = () => {
    if (!client) {
        client = new line.messagingApi.MessagingApiClient({
            channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
        });
    }
    return client;
};

// For pushing normal text
const pushText = (to, text) => {
    getClient().pushMessage({ to, messages: [{ type: 'text', text }] });
};

// For Reply user's message
const replyText = (replyToken, text) => {
    getClient().replyMessage({
        replyToken,
        messages: [{ type: 'text', text }],
    });
};

// For sending reminder before reservation date.
// Use in this format :
// reminderBubble({UserLineId}, coworkingSpace data, reservation data, 3)
const reminderBubble = (to, coworkingSpace, reservation, days) => {
    return notiBubble(
        to,
        coworkingSpace,
        reservation,
        '⏰ Reminder ⏰',
        `${days === 0 ? 'Today is the reservation date!' : `Reservation in ${days} day${days === 1 ? '' : 's'}`}`,
        'Details',
        'https://youtu.be/dQw4w9WgXcQ?si=WR71wwoRu6oMQjd0', // PLACE HOLDER, MUST BE REPLACED WITH BELOW LINE
        // `${FRONTEND_URL}/reservations/${reservation._id}`,
    );
};

// For sending invitation to be co-booker
// Use in this format :
// inviteBubble({UserLineId}, coworkingSpace data, reservation data, 'Owner Name')
const inviteBubble = (to, coworkingSpace, reservation, owner) => {
    return notiBubble(
        to,
        coworkingSpace,
        reservation,
        '🚪 New invitation 🚪',
        `${owner} has invited you to be co-booker!`,
        'Accept',
        'https://youtu.be/dQw4w9WgXcQ?si=WR71wwoRu6oMQjd0', // PLACE HOLDER, MUST BE REPLACED WITH BELOW LINE
        // `${FRONTEND_URL}/invitations/${invitation._id}`,
    );
};

// For sending reservation status when create/update/delete reservation
// Use in this format :
// reservationBubble({UserLineId}, coworkingSpace data, reservation data, 'created')
const reservationBubble = (to, coworkingSpace, reservation, action) => {
    return notiBubble(
        to,
        coworkingSpace,
        reservation,
        '📃 New update of reservation 📃',
        `Your reservation has been ${action}!`,
        'Details',
        'https://youtu.be/dQw4w9WgXcQ?si=WR71wwoRu6oMQjd0', // PLACE HOLDER, MUST BE REPLACED WITH BELOW LINE
        // `${FRONTEND_URL}/reservations/${reservation._id}`,
    );
};

// For send reminder to user in general.
// Use in this format :
// notiBubble({UserLineId}, coworkingSpace data, reservation data, '⏰ Reminder ⏰', 'Reservation in 3 days')
const notiBubble = (
    replyToken, // TEMP, MUST BE REPLACED WITH BELOW LINE (For eco purpose)
    // to,
    coworkingSpace,
    reservation,
    headerTxt,
    descriptionTxt,
    buttonTxt = 'Details',
    detailLink = 'https://youtu.be/dQw4w9WgXcQ?si=WR71wwoRu6oMQjd0', // PLACE HOLDER, MUST BE REPLACED WITH BELOW LINE
    // detailLink = FRONTEND_URL,
) => {
    // TEMP, MUST BE REPLACED WITH BELOW 2 LINES (For eco purpose)
    getClient().replyMessage({
        replyToken,
        // getClient().pushMessage({
        //     to,
        messages: [
            {
                type: 'flex',
                altText: `${headerTxt} ${descriptionTxt}`,
                contents: {
                    type: 'bubble',
                    body: {
                        type: 'box',
                        layout: 'vertical',
                        contents: [
                            {
                                type: 'text',
                                text: headerTxt,
                                decoration: 'none',
                                color: '#a15c86',
                            },
                            {
                                type: 'text',
                                text: coworkingSpace.name,
                                weight: 'bold',
                                size: 'xxl',
                                margin: 'sm',
                            },
                            {
                                type: 'text',
                                text: descriptionTxt,
                                weight: 'regular',
                                size: 'xl',
                                margin: 'none',
                                wrap: true,
                            },
                            {
                                type: 'box',
                                layout: 'vertical',
                                margin: 'lg',
                                spacing: 'sm',
                                contents: [
                                    {
                                        type: 'box',
                                        layout: 'baseline',
                                        spacing: 'sm',
                                        contents: [
                                            {
                                                type: 'text',
                                                text: 'Date',
                                                color: '#aaaaaa',
                                                size: 'sm',
                                                flex: 3,
                                            },
                                            {
                                                type: 'text',
                                                text: reservation.reserveDate,
                                                wrap: true,
                                                color: '#666666',
                                                size: 'sm',
                                                flex: 5,
                                            },
                                        ],
                                    },
                                    {
                                        type: 'box',
                                        layout: 'baseline',
                                        spacing: 'sm',
                                        contents: [
                                            {
                                                type: 'text',
                                                text: 'Open time',
                                                color: '#aaaaaa',
                                                size: 'sm',
                                                flex: 3,
                                                wrap: true,
                                            },
                                            {
                                                type: 'text',
                                                text: `${coworkingSpace.openTime} - ${coworkingSpace.closeTime}`,
                                                wrap: true,
                                                color: '#666666',
                                                size: 'sm',
                                                flex: 5,
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                    footer: {
                        type: 'box',
                        layout: 'vertical',
                        contents: [
                            {
                                type: 'button',
                                action: {
                                    type: 'uri',
                                    label: buttonTxt,
                                    uri: detailLink,
                                },
                            },
                        ],
                    },
                },
            },
        ],
    });
};

module.exports = {
    pushText,
    replyText,
    reminderBubble,
    inviteBubble,
    reservationBubble,
    notiBubble,
    ADD_LINE_LINK,
};
