const { BrevoClient } = require('@getbrevo/brevo');

async function test() {
    try {
        const client = new BrevoClient({ apiKey: 'xkeysib-test' });
        console.log('BrevoClient created');

        // Let's check if the method exists
        if (typeof client.transactionalEmails.sendTransacEmail === 'function') {
            console.log('sendTransacEmail method exists ✅');
        } else {
            console.log('sendTransacEmail method NOT found ❌');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

test();
