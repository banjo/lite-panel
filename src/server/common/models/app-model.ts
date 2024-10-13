export type App = {
    name: string;
    directory: string; // should be fetched from the directory service at init so it's always correct
    domain: string;
    port: number;
};

const from = (app: App): App => app;

export const App = { from };
