import * as fs from 'fs';
import * as path from 'path';

import tokenator from '@yandex-int/tokenator';
import { VaultClient } from '@yandex-int/vault-client';
import { createLogger } from 'vite';

const logger = createLogger('info', { prefix: '[vault]' });

export const SECRETS_PATH = path.resolve(process.cwd(), 'secrets');

export async function vault(version: string): Promise<Record<string, string>> {
    let { vault } = await tokenator(['vault']);
    let vaultClient = new VaultClient(vault);

    let tokens = await vaultClient.getVersion(version);

    return tokens.reduce((memo: Record<string, string>, token) => {
        memo[token.key] = token.value;

        return memo;
    }, {});
}

export async function secrets(version: string): Promise<Record<string, string>> {
    try {
        let secretsVersionPath = path.join(SECRETS_PATH, version);
        let tokens: Record<string, string>;

        if (!fs.existsSync(secretsVersionPath)) {
            logger.info(`Started downloading secrets '${version}'. Please wait...`, { timestamp: true });

            tokens = await vault(version);

            if (tokens) {
                logger.info(`Secrets '${version}' downloaded successfully!`, { timestamp: true });
            }

            if (!fs.existsSync(SECRETS_PATH)) {
                fs.mkdirSync(SECRETS_PATH, 0o755);
            }

            fs.writeFileSync(secretsVersionPath, JSON.stringify(tokens, null, 4));
        } else {
            tokens = JSON.parse(fs.readFileSync(secretsVersionPath, 'utf8'));
        }

        return tokens;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        if (error.message.includes('self signed certificate in certificate chain')) {
            logger.error('Internal certificate YandexInternalRootCA.pem do not installed properly.');
            logger.error('Please run `./tools/prepare-internal-root-ca.sh` to fix it');
            logger.error(error);
        } else {
            logger.error('Access denied or unexpected error. Please call @stepler or @polrk for help.');
            logger.error(error);
        }

        throw error;
    }
}
