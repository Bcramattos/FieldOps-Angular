import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-wrap">
      <div class="login-card">
        <div class="login-logo">
          <span class="login-emoji">&#127936;</span>
          <h1>FieldOps</h1>
          <p class="login-sub">Plataforma de Inspe&ccedil;&atilde;o em Campo</p>
        </div>

        <form (ngSubmit)="entrar()" class="login-form">
          <label class="form-label">E-mail</label>
          <input type="email" class="form-control" [(ngModel)]="email" name="email"
                 placeholder="voce@empresa.com.br" required>
          <label class="form-label mt-3">Senha</label>
          <input type="password" class="form-control" [(ngModel)]="senha" name="senha"
                 placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;" required>
          <button type="submit" class="btn btn-primary w-100 mt-4 login-btn">
            <i class="bi bi-box-arrow-in-right"></i> Entrar
          </button>
          <div class="login-hint mt-3">
            Prot&oacute;tipo &mdash; qualquer e-mail e senha entram no painel.
          </div>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  senha = '';

  constructor(private router: Router) {}

  entrar(): void {
    // prot&oacute;tipo: sem autentica&ccedil;&atilde;o real (fora do escopo)
    this.router.navigate(['/dashboard']);
  }
}
