const { Brevo } = require('@getbrevo/brevo');
const keys = Object.keys(Brevo);
console.log('Total keys:', keys.length);
console.log('TransactionalEmailsApi found:', keys.includes('TransactionalEmailsApi'));
console.log('TransactionalEmails found:', keys.includes('TransactionalEmails'));
console.log('TransactionalEmailsApi namespace found:', keys.includes('transactionalEmails'));

// Print keys that start with Transactional
console.log('Transactional keys:', keys.filter(k => k.startsWith('Transactional')));
