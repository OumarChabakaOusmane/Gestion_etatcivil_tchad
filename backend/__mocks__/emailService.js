// Mock pour emailService
const emailService = {
    sendOTPEmail: jest.fn(() => Promise.resolve({ messageId: 'mock-message-id' })),
    sendPasswordResetEmail: jest.fn(() => Promise.resolve({ messageId: 'mock-message-id' })),
    sendEmail: jest.fn(() => Promise.resolve({ messageId: 'mock-message-id' }))
};

module.exports = emailService;
