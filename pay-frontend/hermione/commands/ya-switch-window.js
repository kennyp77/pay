async function yaSwitchWindow(urlOrTitle) {
    const handles = await this.windowHandles();
    const regexp = new RegExp(urlOrTitle);

    for (let h in handles.value) {
        const windowUrl = await this.window(handles.value[h]).getUrl();
        const windowTitle = await this.window(handles.value[h]).title().value;

        if (regexp.test(windowUrl) || regexp.test(windowTitle)) {
            return await this.switchTab(handles.value[h]);
        }
    }
}

module.exports = {
    yaSwitchWindow,
};
