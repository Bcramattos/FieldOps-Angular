import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DemoRole } from '../../core/fieldops.models';
import { FieldOpsStore } from '../../core/fieldops.store';

@Component({
  selector: 'app-login-page',
  standalone: false,
  templateUrl: './login-page.component.html',
  styleUrl: '../../theme/original/login.css',
})
export class LoginPageComponent {
  email = '';
  password = '';
  unit = 'guaiba';
  role: DemoRole = 'Supervisor';
  remember = true;
  showPassword = false;
  message = '';

  constructor(
    private readonly store: FieldOpsStore,
    private readonly router: Router,
  ) {}

  enter(): void {
    const email = this.email.trim();
    if (!email || !this.password.trim()) {
      this.message = 'Informe seu e-mail e senha para continuar.';
      return;
    }
    const firstName = email.split('@')[0].split(/[._-]/)[0];
    const name = firstName
      ? firstName.split(/[._-]/).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
      : 'Equipe';
    this.store.saveUser(name, email, this.role, this.remember);
    this.router.navigate(['/dashboard']);
  }

  showDemoHint(message = 'Este ambiente é demonstrativo. Use qualquer e-mail válido e uma senha para entrar.'): void {
    this.message = message;
  }
}
