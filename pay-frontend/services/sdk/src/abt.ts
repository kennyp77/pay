import { Experiment, isExpFlagEnabled } from '@trust/utils/experiment';

const setExperimentStub = (_: Experiment): void => undefined;

let EXPS: Experiment = { flags: {} };

// eslint-disable-next-line import/no-mutable-exports
export const setExperiment = {
    fn: setExperimentStub,
};

export const getExperiment: Promise<Experiment> = new Promise((resolve) => {
    setExperiment.fn = ({ flags, experiments }: Experiment): void => {
        setExperiment.fn = setExperimentStub;
        EXPS = { flags, experiments };
        resolve(EXPS);
    };
});

export const hasExp = async (name: string, checkValue?: string): Promise<boolean> => {
    const experiment = await getExperiment;

    return isExpFlagEnabled(experiment, name, checkValue);
};

export const hasExpSync = (name: string, checkValue?: string): boolean => {
    return isExpFlagEnabled(EXPS, name, checkValue);
};
