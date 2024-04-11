module.exports = {
    ...jest.requireActual('../../url'),
    redirectTo: jest.fn(),
    replaceWith: jest.fn(),
    getSource: jest.fn().mockReturnValue(''),
};
