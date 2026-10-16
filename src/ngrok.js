const dotenv = require('dotenv');
dotenv.config({ path: './src/config/config.env' });

const ngrok = require('@ngrok/ngrok');

const PORT = process.env.PORT || 5000;

async function forwardToApp() {
    const forwarder = await ngrok.forward({
        addr: PORT,
        authtoken_from_env: true,
        domain: 'wreath-dividing-foothill.ngrok-free.dev',
    });
    console.log(`Available at: ${forwarder.url()}`);
}

forwardToApp();
process.stdin.resume();
