export {};

declare global {
  interface Window {
    __CONFIG: {
      uid: string;
      login: string;
      lang: string;
    };
  }
}
