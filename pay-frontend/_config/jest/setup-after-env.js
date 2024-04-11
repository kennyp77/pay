import '@testing-library/jest-dom/extend-expect';

Object.defineProperty(window, 'requestAnimationFrame', {
    writable: true,
    value: (callback) => setTimeout(() => callback(Date.now()), 0),
});

Object.defineProperty(document, 'visibilityState', {
    writable: true,
    value: 'visible',
});
