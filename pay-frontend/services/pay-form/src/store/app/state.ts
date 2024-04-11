import { AppScreen, AppPending, AppAuth3ds } from '../../typings';

export type ActionError = {
    description: string;
    action: () => void;
    actionText: string;
};
export interface AppState {
    screen: AppScreen;
    error: ActionError | null;
    pending: AppPending | null;
    auth3ds: AppAuth3ds | null;
}

export const stateIdentifier = 'app';

export const createState = (): AppState => ({
    screen: AppScreen.Order,
    error: null,
    pending: null,
    auth3ds: null,
});
