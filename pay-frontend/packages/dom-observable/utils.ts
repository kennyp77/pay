export const nodeListForEach = (elements: NodeList, callback: (element: Node) => any): void => {
    // Через прототип массива - не все браузеры поддерживают NodeList.forEach
    Array.prototype.forEach.call(elements, callback);
};
