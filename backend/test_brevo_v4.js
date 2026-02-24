const { Brevo } = require('@getbrevo/brevo');
console.log('Brevo keys:', Object.keys(Brevo));
if (Brevo.transactionalEmails) {
    console.log('transactionalEmails keys:', Object.keys(Brevo.transactionalEmails));
    const apiInstance = new Brevo.TransactionalEmailsApi();
    console.log('Created TransactionalEmailsApi');
} else {
    console.log('transactionalEmails is undefined');
}
