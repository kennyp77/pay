export interface UserCard {
    id: string;
    uid: number;
    last4: string;
    cardNetwork: string;
    issuerBank: string;
    allowedAuthMethods: string[];
}
