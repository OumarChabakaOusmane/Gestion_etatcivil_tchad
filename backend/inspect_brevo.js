const Brevo = require('@getbrevo/brevo');
console.log('Brevo keys:', Object.keys(Brevo));
if (Brevo.ApiClient) {
    console.log('ApiClient keys:', Object.keys(Brevo.ApiClient));
} else {
    console.log('ApiClient is undefined');
}
