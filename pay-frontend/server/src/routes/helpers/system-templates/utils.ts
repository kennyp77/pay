import fs from 'fs';
import path from 'path';

export const fileExists = (_path: string): boolean => {
    try {
        fs.accessSync(_path, fs.constants.R_OK);

        return true;
    } catch (err) {
        // TODO: Log error
        return false;
    }
};

export const readdirDirectories = (_path: string): string[] =>
    fs
        .readdirSync(_path, { withFileTypes: true })
        .filter((item) => item.isDirectory())
        .map((dir) => dir.name);

export const readdirFiles = (_path: string): string[] =>
    fs
        .readdirSync(_path, { withFileTypes: true })
        .filter((item) => item.isFile())
        .map((file) => file.name);

export const fileName = (_path: string): string => path.basename(_path).split('.')[0];

export const readFile = (_path: string): string => {
    try {
        return fs.readFileSync(_path, 'utf-8');
    } catch (err) {
        // TODO: Log error
        return '';
    }
};
