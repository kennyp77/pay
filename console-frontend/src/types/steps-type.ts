export enum StepVals {
  First = 1,
  Second = 2,
  Third = 3,
}

export type Step = {
  value: StepVals;
  title: string;
  href: string;
};
