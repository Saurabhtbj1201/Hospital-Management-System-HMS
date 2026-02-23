const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const sesClient = new SESClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

/**
 * Send email using AWS SES
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} text - Plain text body
 * @param {string} html - HTML body
 */
const sendEmail = async (to, subject, text, html) => {
    // If credentials are not set, log and return (for development)
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
        console.log('AWS SES credentials not found. Email mocked:');
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body: ${text}`);
        return { success: true, messageId: 'mock-id' };
    }

    try {
        const command = new SendEmailCommand({
            Destination: {
                ToAddresses: [to],
            },
            Message: {
                Body: {
                    Html: { Data: html || text },
                    Text: { Data: text },
                },
                Subject: { Data: subject },
            },
            Source: process.env.AWS_SES_FROM_EMAIL || 'noreply@hms-portal.com',
        });

        const response = await sesClient.send(command);
        return { success: true, messageId: response.MessageId };
    } catch (error) {
        console.error('AWS SES Error:', error);
        throw error;
    }
};

module.exports = { sendEmail };
