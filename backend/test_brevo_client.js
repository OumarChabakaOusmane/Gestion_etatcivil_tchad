const { BrevoClient } = require('@getbrevo/brevo');

async function test() {
    try {
        const client = new BrevoClient({ apiKey: 'xkeysib-test' });
        console.log('BrevoClient created');
        console.log('transactionalEmails client:', !!client.transactionalEmails);

        // Let's check the methods on client.transactionalEmails
        console.log('transactionalEmails methods:', Object.keys(client.transactionalEmails));
    } catch (error) {
        console.error('Error:', error.message);
    }
}

test();
