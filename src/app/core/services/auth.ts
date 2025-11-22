import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { tap, map, Observable, catchError, of, finalize } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { AuthTokens, DecodedToken, LoginRequest } from '../../shared/models/auth.model';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);

    private apiUrl = 'https://localhost:7028/api/Auth';
    currentUser = signal<DecodedToken | null>(null); // contains user logged in data (or null)
    isLoggedIn = computed(() => !!this.currentUser()); // isLoggedIn = computed(() => Boolean(this.currentUser()));

    constructor() {
        this.loadAuthInfoFromStorage();
    }

    login(credentials: LoginRequest, rememberMe: boolean): Observable<AuthTokens> {
        return this.http.post<AuthTokens>(`${this.apiUrl}/login`, credentials).pipe(
            tap((tokens) => {
                this.setAuthInfo(tokens, rememberMe);
            })
        );
    }

    refreshTokenApi(refreshToken: string, username: string): Observable<AuthTokens> {
        return this.http.post<AuthTokens>(`${this.apiUrl}/refresh`, {
            refreshToken,
            username,
        });
    }

    logout() {
        const refreshToken = this.getRefreshToken();

        if (refreshToken) {
            // invalidates token on server side
            this.http
                .post(`${this.apiUrl}/logout`, { refreshToken })
                .pipe(finalize(() => this.clearClientAuthData()))
                .subscribe();
        } else {
            this.clearClientAuthData();
        }
    }

    // storage
    private getStorage(): Storage {
        return localStorage.getItem('accessToken') ? localStorage : sessionStorage; // token in localStorage = rememberMe is true
    }

    private loadAuthInfoFromStorage(): void {
        const token = this.getAccessToken();
        if (token && !this.isTokenExpired(token)) {
            const decoded = this.decodeToken(token);
            this.currentUser.set(decoded);
        } else {
            // token invalid/expired, handled by interceptor
            if (token) {
                const decoded = this.decodeToken(token);
                this.currentUser.set(decoded); // set username for refresh
            }
        }
    }

    setAuthInfo(tokens: AuthTokens, rememberMe: boolean) {
        const storage = rememberMe ? localStorage : sessionStorage;

        // cleans other storage to avoid duplicates
        const otherStorage = rememberMe ? sessionStorage : localStorage;
        otherStorage.removeItem('accessToken');
        otherStorage.removeItem('refreshToken');

        storage.setItem('accessToken', tokens.accessToken);
        if (tokens.refreshToken) {
            storage.setItem('refreshToken', tokens.refreshToken);
        }

        const decoded = this.decodeToken(tokens.accessToken);
        this.currentUser.set(decoded);
    }

    saveRefreshedTokens(tokens: AuthTokens): void {
        const storage = this.getStorage(); // keeps current storage
        storage.setItem('accessToken', tokens.accessToken);
        storage.setItem('refreshToken', tokens.refreshToken);

        const decoded = this.decodeToken(tokens.accessToken);
        this.currentUser.set(decoded);
    }

    private clearClientAuthData(): void {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');

        this.currentUser.set(null);
        this.router.navigate(['/']); 
    }

    getAccessToken(): string | null {
        return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    }

    getRefreshToken(): string | null {
        return localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
    }

    getUsername(): string | null {
        const user = this.currentUser();
        return user?.unique_name || user?.['username'] || null;
    }

    private decodeToken(token: string): DecodedToken | null {
        try {
            return jwtDecode<DecodedToken>(token);
        } catch {
            return null;
        }
    }

    private isTokenExpired(token: string): boolean {
        const decoded = this.decodeToken(token);
        if (!decoded || !decoded.exp) return true;
        return Math.floor(Date.now() / 1000) >= decoded.exp;
    }
}
