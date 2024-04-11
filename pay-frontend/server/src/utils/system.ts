import os from 'os';

export function getSystemUsername() {
    const { env } = process;

    let username = env.SUDO_USER || env.LOGNAME || env.USER || env.LNAME || env.USERNAME;

    if (!username) {
        try {
            username = os.userInfo().username;
        } catch {
            username = 'unknown';
        }
    }

    return username;
}
