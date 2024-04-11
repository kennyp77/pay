async function yaLoginUser(user) {
    await this.auth(user);
}

async function yaLogoutUser(user) {
    await this.logout(user);
}

async function yaLogoutFromAllAcc(users) {
    for (let user in users) {
        try {
            await this.yaLogoutUser(user);
        } catch (e) {
            // just to catch
        }
    }
}

async function yaSwitchOnPayForm() {
    await this.yaSwitchWindow('Yandex Pay');
}

async function yaSwitchOnDemo() {
    await this.yaSwitchWindow('Yandex Pay Demo page');
}

module.exports = {
    yaLoginUser,
    yaLogoutUser,
    yaLogoutFromAllAcc,
    yaSwitchOnPayForm,
    yaSwitchOnDemo,
};
