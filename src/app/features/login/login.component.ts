import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrl: '../../theme/original/login.css',
  template: `


    <!-- NAVBAR -->
    <nav class="navbar navbar-expand-lg bg-white border-bottom">
        <div class="container">

            <a class="navbar-brand d-flex align-items-center gap-2" href="#">
                <div class="brand-icon">
                    <i class="bi bi-cpu"></i>
                </div>

                <span class="brand-name">
                    FIELDOPS
                </span>
            </a>

            <div class="d-flex align-items-center gap-3">

                <div class="system-status">
                    <span class="status-dot"></span>
                    Sistema operacional
                </div>

                <div class="security-info d-none d-md-flex">
                    <i class="bi bi-shield-check"></i>
                    TLS 1.3
                </div>

            </div>

        </div>
    </nav>


    <!-- CONTEÚDO -->
    <main class="login-section">

        <div class="container">

            <div class="row justify-content-center">

                <div class="col-12 col-lg-10 col-xl-9">

                    <div class="login-card">

                        <div class="row g-0">


                            <!-- LADO ESQUERDO -->
                            <div class="col-lg-6">

                                <div class="login-info">

                                    <span class="badge-system">
                                        <span class="status-dot"></span>
                                        SISTEMA OPERACIONAL
                                    </span>

                                    <h1>
                                        Gestão técnica
                                        <span>mais inteligente.</span>
                                    </h1>

                                    <p class="description">
                                        Plataforma integrada para inspeções,
                                        auditorias, manutenção e gestão de
                                        ativos industriais.
                                    </p>


                                    <!-- Recursos -->
                                    <div class="features">

                                        <div class="feature-item">

                                            <div class="feature-icon">
                                                <i class="bi bi-activity"></i>
                                            </div>

                                            <div>
                                                <strong>
                                                    Telemetria em tempo real
                                                </strong>

                                                <small>
                                                    Monitore seus ativos
                                                    continuamente.
                                                </small>
                                            </div>

                                        </div>


                                        <div class="feature-item">

                                            <div class="feature-icon">
                                                <i class="bi bi-shield-check"></i>
                                            </div>

                                            <div>
                                                <strong>
                                                    Segurança corporativa
                                                </strong>

                                                <small>
                                                    Dados protegidos e
                                                    autenticação segura.
                                                </small>
                                            </div>

                                        </div>


                                        <div class="feature-item">

                                            <div class="feature-icon">
                                                <i class="bi bi-bar-chart-line"></i>
                                            </div>

                                            <div>
                                                <strong>
                                                    Indicadores operacionais
                                                </strong>

                                                <small>
                                                    Acompanhe o desempenho
                                                    da sua operação.
                                                </small>
                                            </div>

                                        </div>

                                    </div>


                                    <!-- STATUS -->
                                    <div class="system-card">

                                        <div class="system-card-header">

                                            <span>
                                                <i class="bi bi-hdd-network"></i>
                                                Gateway operacional
                                            </span>

                                            <span class="online">
                                                Online
                                            </span>

                                        </div>

                                        <div class="system-card-data">

                                            <div>
                                                <small>NODE</small>
                                                <strong>BR-SP01</strong>
                                            </div>

                                            <div>
                                                <small>UPTIME</small>
                                                <strong>99.98%</strong>
                                            </div>

                                            <div>
                                                <small>STATUS</small>
                                                <strong class="text-success">
                                                    Ativo
                                                </strong>
                                            </div>

                                        </div>

                                    </div>

                                </div>

                            </div>


                            <!-- LADO DIREITO -->
                            <div class="col-lg-6">

                                <div class="login-form-area">

                                    <div class="form-header">

                                        <div>

                                            <span class="form-label-top">
                                                ACESSO SEGURO
                                            </span>

                                            <h2>
                                                Bem-vindo de volta
                                            </h2>

                                            <p>
                                                Entre com suas credenciais
                                                corporativas.
                                            </p>

                                        </div>

                                        <div class="form-security-icon">
                                            <i class="bi bi-shield-lock"></i>
                                        </div>

                                    </div>


                                    <!-- ALERTA -->
                                    <div
                                        id="authAlert"
                                        class="alert alert-info"
                                        [class.d-none]="!message"
                                        role="alert"
                                    >
                                        <i class="bi bi-info-circle"></i>

                                        <span id="authAlertText">{{ message }}</span>
                                    </div>


                                    <!-- FORMULÁRIO -->
                                    <form id="loginForm" (ngSubmit)="enter()" #loginForm="ngForm">

                                        <!-- EMAIL -->
                                        <div class="mb-4">

                                            <label
                                                for="corporateId"
                                                class="form-label"
                                            >
                                                E-mail corporativo
                                            </label>

                                            <div class="input-group custom-input">

                                                <span class="input-group-text">
                                                    <i class="bi bi-person"></i>
                                                </span>

                                                <input
                                                    type="email"
                                                    class="form-control"
                                                    id="corporateId"
                                                    name="email"
                                                    [(ngModel)]="email"
                                                    placeholder="seu@email.com"
                                                    autocomplete="username"
                                                    required
                                                >

                                            </div>

                                        </div>


                                        <!-- SENHA -->
                                        <div class="mb-4">

                                            <div class="d-flex justify-content-between">

                                                <label
                                                    for="password"
                                                    class="form-label"
                                                >
                                                    Senha
                                                </label>

                                                <button type="button" class="forgot-password" (click)="showDemoHint('A redefinição de acesso será simulada pelo administrador nesta demonstração.')">
                                                    Esqueci minha senha
                                                </button>

                                            </div>

                                            <div class="input-group custom-input">

                                                <span class="input-group-text">
                                                    <i class="bi bi-lock"></i>
                                                </span>

                                                <input
                                                    type="password"
                                                    class="form-control"
                                                    id="password"
                                                    name="password"
                                                    [(ngModel)]="password"
                                                    [type]="showPassword ? 'text' : 'password'"
                                                    placeholder="Digite sua senha"
                                                    autocomplete="current-password"
                                                    required
                                                >

                                                <button
                                                    type="button"
                                                    class="btn-password"
                                                    id="togglePassword"
                                                    aria-label="Mostrar senha"
                                                    (click)="showPassword = !showPassword"
                                                >
                                                    <i [class]="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                                                </button>

                                            </div>

                                        </div>


                                        <!-- UNIDADE -->
                                        <div class="mb-4">

                                            <label
                                                for="plant"
                                                class="form-label"
                                            >
                                                Unidade operacional
                                            </label>

                                            <div class="input-group custom-input">

                                                <span class="input-group-text">
                                                    <i class="bi bi-building"></i>
                                                </span>

                                                <select
                                                    class="form-select"
                                                    id="plant"
                                                    name="unit"
                                                    [(ngModel)]="unit"
                                                >

                                                    <option value="guaiba">
                                                        Complexo Industrial Sul
                                                        - Usina Guaíba
                                                    </option>

                                                    <option value="camacari">
                                                        Polo Petroquímico
                                                        de Camaçari
                                                    </option>

                                                    <option value="valeverde">
                                                        Mineração Vale Verde
                                                    </option>

                                                    <option value="siderurgica">
                                                        Siderúrgica Central
                                                        Paulista
                                                    </option>

                                                </select>

                                            </div>

                                        </div>


                                        <!-- PERFIL DEMONSTRATIVO -->
                                        <div class="mb-4">
                                            <label for="demoRole" class="form-label">Perfil de demonstração</label>
                                            <div class="input-group custom-input">
                                                <span class="input-group-text"><i class="bi bi-person-badge"></i></span>
                                                <select class="form-select" id="demoRole" name="role" [(ngModel)]="role">
                                                    <option value="Administrador">Administrador</option>
                                                    <option value="Supervisor">Supervisor Técnico Sênior</option>
                                                    <option value="Técnico">Técnico de Campo</option>
                                                    <option value="Revisor">Revisor de Inspeções</option>
                                                </select>
                                            </div>
                                            <small class="text-muted d-block mt-2">O perfil selecionado controla os módulos e ações disponíveis nesta demonstração.</small>
                                        </div>

                                        <!-- LEMBRAR -->
                                        <div class="form-check mb-4">

                                            <input
                                                class="form-check-input"
                                                type="checkbox"
                                                id="remember"
                                                name="remember"
                                                [(ngModel)]="remember"
                                            >

                                            <label
                                                class="form-check-label"
                                                for="remember"
                                            >
                                                Manter sessão ativa neste
                                                dispositivo
                                            </label>

                                        </div>


                                        <!-- BOTÃO -->
                                        <button type="submit" class="btn btn-primary btn-login w-100" id="authButton" [disabled]="loginForm.invalid">

                                            <span>
                                                Entrar na plataforma
                                            </span>

                                            <i class="bi bi-arrow-right"></i>

                                        </button>


                                        <!-- SMARTCARD -->
                                        <button
                                            type="button"
                                            class="btn btn-outline-secondary btn-smartcard w-100 mt-3"
                                            (click)="showDemoHint('A autenticação por certificado não está conectada neste protótipo.')"
                                        >

                                            <i class="bi bi-credit-card-2-front"></i>

                                            Entrar com certificado digital

                                        </button>

                                    </form>


                                    <!-- SEGURANÇA -->
                                    <div class="security-footer">

                                        <i class="bi bi-shield-check"></i>

                                        <div>

                                            <strong>
                                                Ambiente seguro
                                            </strong>

                                            <small>
                                                Conexão protegida por
                                                criptografia TLS 1.3
                                            </small>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>


                    <!-- RODAPÉ -->
                    <div class="login-footer">

                        <span>
                            © 2025 FieldOps Infrastructure
                        </span>

                        <div>

                            <span>
                                <i class="bi bi-check-circle"></i>
                                ISO 27001
                            </span>

                            <span>
                                <i class="bi bi-shield"></i>
                                SOC 2
                            </span>

                            <span>
                                <i class="bi bi-lock"></i>
                                Ambiente seguro
                            </span>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    </main>





  `
})
export class LoginComponent {
  message = '';
  email = '';
  senha = '';

  constructor(private router: Router) {}

  enter(): void {
    sessionStorage.setItem('fieldops_logado', 'true');
    this.router.navigate(['/dashboard']);
  }
}
