const line = require('@line/bot-sdk');

const ADD_LINE_LINK = 'https://lin.ee/Qp3cqaj';

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
exports.pushText = (to, text) => {
    getClient().pushMessage({ to, messages: [{ type: 'text', text }] });
};

// For Reply user's message
exports.replyText = (replyToken, text) => {
    getClient().replyMessage({
        replyToken,
        messages: [{ type: 'text', text }],
    });
};

// For send reminder to user.
// Use in this format :
// reminderBubble({UserLineId}, "Co name", "Reservation in 3 Days", "12-10-69", "08:00 - 16:00", {reservationInfoUrl})
exports.reminderBubble = (
    to,
    coworkingSpaceName,
    reservationMsg,
    date,
    time,
    url,
) => {
    getClient().pushMessage({
        to,
        messages: [
            {
                type: 'flex',
                altText: 'reminder message',
                contents: {
                    type: 'bubble',
                    body: {
                        type: 'box',
                        layout: 'vertical',
                        contents: [
                            {
                                type: 'text',
                                text: '⏰ Reminder ⏰',
                                decoration: 'none',
                                color: '#a15c86',
                            },
                            {
                                type: 'text',
                                text: coworkingSpaceName,
                                weight: 'bold',
                                size: 'xxl',
                                margin: 'sm',
                            },
                            {
                                type: 'text',
                                text: reservationMsg,
                                weight: 'regular',
                                size: 'xl',
                                margin: 'none',
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
                                                flex: 1,
                                            },
                                            {
                                                type: 'text',
                                                text: date,
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
                                                text: 'Time',
                                                color: '#aaaaaa',
                                                size: 'sm',
                                                flex: 1,
                                            },
                                            {
                                                type: 'text',
                                                text: time,
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
                                    label: 'Details',
                                    uri: url,
                                },
                            },
                        ],
                    },
                },
            },
        ],
    });
};
module.exports.ADD_LINE_LINK = ADD_LINE_LINK;
