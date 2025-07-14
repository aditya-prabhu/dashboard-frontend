import { LogLevel } from '@azure/msal-browser';

export const msalConfig = {
    auth: {
        clientId: 'b9e8a5c9-1a29-491c-98b4-e00e4669de78', 
        authority: 'https://login.microsoftonline.com/2e319086-9a26-46a3-865f-615bed576786', 
        redirectUri: '/', 
        postLogoutRedirectUri: '/', 
        navigateToLoginRequestUrl: false, 
    },
    cache: {
        cacheLocation: 'sessionStorage', 
        storeAuthStateInCookie: false, 
    },
    system: {
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                if (containsPii) {
                    return;
                }
                switch (level) {
                    case LogLevel.Error:
                        console.error(message);
                        return;
                    case LogLevel.Info:
                        console.info(message);
                        return;
                    case LogLevel.Verbose:
                        console.debug(message);
                        return;
                    case LogLevel.Warning:
                        console.warn(message);
                        return;
                    default:
                        return;
                }
            },
        },
    },
};

// Add your scopeUri here (replace with your actual scope URI)
const scopeUri = "api://b9e8a5c9-1a29-491c-98b4-e00e4669de78/beeline";

export const loginRequest = {
    scopes: [scopeUri],
};