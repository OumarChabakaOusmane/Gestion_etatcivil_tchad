const Brevo = require('@getbrevo/brevo');
try {
    const defaultClient = Brevo.ApiClient.instance;
    console.log('Brevo ApiClient instance found');
    const apiInstance = new Brevo.TransactionalEmailsApi();
    console.log('Brevo TransactionalEmailsApi instance created');
} catch (error) {
    console.error('Error initializing Brevo:', error.message);
    process.exit(1);
}
