// Mock pour smsService
const smsService = {
    sendOtpSms: jest.fn(() => Promise.resolve({ success: true })),
    sendSms: jest.fn(() => Promise.resolve({ success: true }))
};

module.exports = smsService;
