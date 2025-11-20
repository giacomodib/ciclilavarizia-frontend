import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { HeaderActions } from "./header-actions/header-actions";

@Component({
  selector: 'app-header',
  imports: [CommonModule, MatButtonModule, MatIconModule, MatToolbarModule, HeaderActions],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {

}
