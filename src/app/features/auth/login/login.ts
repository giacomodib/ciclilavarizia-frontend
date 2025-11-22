import { AuthService } from '../../../core/services/auth';
import { Component, inject, signal } from '@angular/core';
import { MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
    selector: 'app-login',
    imports: [
        CommonModule,
        MatIconButton,
        MatIcon,
        MatDialogClose,
        MatFormField,
        MatInput,
        MatSuffix,
        MatPrefix,
        MatButton,
        ReactiveFormsModule,
        MatCheckbox,
    ],
    template: `
        <div class="p-8 max-w-[400px] flex flex-col">
            <div class="flex justify-between">
                <div>
                    <h2 class="text-xl font-medium mb-1">Sign In</h2>
                    <p class="text-sm text-gray-500">
                        Sign in to your account to continue shopping
                    </p>
                </div>
                <button tabindex="-1" matIconButton class="-mt-2 -mr-2" mat-dialog-close>
                    <mat-icon>close</mat-icon>
                </button>
            </div>
            <form class="mt-6" [formGroup]="signInForm" (ngSubmit)="signIn()">
                <mat-form-field class="w-full mb-4">
                    <input
                        matInput
                        formControlName="username"
                        type="email"
                        placeholder="Enter your username or email"
                    />
                    <mat-icon matPrefix>email</mat-icon>
                </mat-form-field>
                <mat-form-field class="w-full mb-2">
                    <input
                        matInput
                        formControlName="password"
                        type="password"
                        [type]="passwordVisible() ? 'text' : 'password'"
                        placeholder="Enter your password"
                    />
                    <mat-icon matPrefix>lock</mat-icon>
                    <button
                        matSuffix
                        matIconButton
                        type="button"
                        class="mr-2"
                        (click)="passwordVisible.set(!passwordVisible())"
                    >
                        <mat-icon
                            [fontIcon]="passwordVisible() ? 'visibility_off' : 'visibility'"
                        ></mat-icon>
                    </button>
                </mat-form-field>
                <div class="flex items-center justify-between mb-6">
                    <mat-checkbox formControlName="rememberMe" color="primary">
                        Remember me
                    </mat-checkbox>
                    <!-- <a href="#" class="text-sm text-primary hover:underline">Forgot password?</a> -->
                </div>
                <button type="submit" matButton="filled" class="w-full">Sign In</button>
                @if (errorMessage()) {
                <div
                    class="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded border border-red-200 flex items-center gap-2"
                >
                    <mat-icon class="text-sm h-4 w-4 text-red-600">error</mat-icon>
                    {{ errorMessage() }}
                </div>
                }
            </form>
        </div>
    `,
    styles: ``,
})
export default class Login {
    private authService = inject(AuthService);
    private dialogRef = inject(MatDialogRef<Login>);

    fb = inject(NonNullableFormBuilder);
    passwordVisible = signal(false);
    isLoading = signal(false);
    errorMessage = signal<string | null>(null);

    signInForm = this.fb.group({
        username: ['claudio.orloffo@example.com', Validators.required],
        password: ['on1off0', Validators.required],
        rememberMe: [false] 
    });

    signIn() {
        if (this.signInForm.invalid) {
            this.signInForm.markAllAsTouched();
            return;
        }
        this.isLoading.set(true);
        this.errorMessage.set(null);
        const { username, password, rememberMe} = this.signInForm.getRawValue();
        this.authService.login({ username, password }, rememberMe).subscribe({
            next: (response) => {
                console.log('Login successful!', response);
                this.isLoading.set(false);
                this.dialogRef.close(true);
            },
            error: (err) => {
                console.error('Login error', err);
                this.isLoading.set(false);
                this.errorMessage.set('Email or password not correct.');
            },
        });
    }
}
