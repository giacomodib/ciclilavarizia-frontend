import { Component, inject } from '@angular/core';
import Login from '../../../../features/auth/login/login';
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header-actions',
  imports: [MatButton, MatIconButton, MatIcon, RouterLink ],
  templateUrl: './header-actions.html',
  styleUrl: './header-actions.scss',
})
export class HeaderActions {
readonly dialog = inject(MatDialog);

  openLogin() {
    this.dialog.open(Login, {
      width: '400px', 
      // disableClose: true // avoids closing window by clicking outside
    });
  }
}
