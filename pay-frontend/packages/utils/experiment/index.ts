import pathOr from '@tinkoff/utils/object/pathOr';

export type FlagValue = string | number | boolean;

export type ExperimentConfig = {
    HANDLER: string;
    CONTEXT: Record<string, Record<string, FlagValue>>;
    CONDITION: string;
};

export interface Experiment {
    version?: number;
    configs?: ExperimentConfig[];
    flags: Record<string, FlagValue>;
    testIds?: string[];
    boxes?: string;
    experiments?: string;
}

export const getExpFlag = <T = string>(
    experiment: Experiment,
    flagName: string,
    defaultValue: T = undefined,
): T | undefined => {
    return pathOr(['flags', flagName], defaultValue, experiment);
};

export const isExpFlagEnabled = (
    experiment: Experiment,
    flagName: string,
    checkValue?: FlagValue,
): boolean => {
    const value = getExpFlag(experiment, flagName);

    if (typeof value === 'undefined') {
        return false;
    }

    if (typeof checkValue === 'undefined') {
        return true;
    }

    return value === checkValue;
};
