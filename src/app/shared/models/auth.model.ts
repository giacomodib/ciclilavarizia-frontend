export interface LoginRequest {
    username: string;
    password: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface DecodedToken {
    unique_name?: string; 
    role?: string;
    exp?: number;
    iat?: number;
    nbf?: number;
    nameid?: string; 
    iss?: string;
    [key: string]: any; // any other property with a name, and its value could be any ... works as a wildcard for the Token.
}