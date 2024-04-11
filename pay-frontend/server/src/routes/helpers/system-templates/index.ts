import config from '../../../configs';
import logger from '../../../core/logger';

import { fileExists, readdirFiles, readFile, fileName } from './utils';

class SystemTemplates extends Map<string, string> {
    protected static _instance: SystemTemplates;

    static getInstance(templatesPath: string): SystemTemplates {
        if (!this._instance) {
            this._instance = new SystemTemplates(templatesPath);
        }

        return this._instance;
    }

    protected constructor(templatesPath: string) {
        super();

        const templates = readdirFiles(templatesPath);

        this._loadTemplates(templates, templatesPath);
    }

    protected _loadTemplates(templates: string[], templatesPath: string): void {
        const foundTemplates: string[] = [];

        templates.forEach((templateFile) => {
            const template = fileName(templateFile);
            const templatePath = `${templatesPath}/${templateFile}`;
            const data = fileExists(templatePath) ? readFile(templatePath) : '';

            if (data) {
                foundTemplates.push(template);
                this.set(template, data);
            } else {
                logger.warn(`Unable to load '${template}' template by path '${templatePath}'`);
            }
        });

        logger.info(`Loaded system templates — '${foundTemplates.join()}'`);
    }

    getTemplate(template: string): string {
        if (this.has(template)) {
            return this.get(template);
        }

        return '';
    }
}

export default SystemTemplates.getInstance(config.systemTemplatesPath);
