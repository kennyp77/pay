module.exports = {
    ...jest.requireActual('../helpers.ts'),
    getTop: jest.fn(),
    getOpener: jest.fn(),
    openWindow: jest.fn(),
};
