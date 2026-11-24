# FieldOps Angular

Aplicação de inspeções de campo em Angular, com o layout e as folhas de estilo do compacto HTML/CSS/Bootstrap original.

## Executar

```bash
npm install
npm start
```

Abra `http://localhost:4200`. O acesso é demonstrativo: use qualquer e-mail válido e uma senha. Escolha o perfil de demonstração na tela de login. Não há autenticação ou API conectada.

## Módulos

- Dashboard com totais por estado, atrasos, fila de revisão, criticidade das não conformidades e tendências recentes.
- Acompanhamento com filtros por texto, cliente, técnico, estado, prioridade e período; também permite iniciar, enviar para revisão e cancelar com justificativa.
- Planejamento com seleção encadeada de modelo publicado, cliente, local e equipamento, além de técnico, supervisor, prazo e prioridade.
- Revisão somente leitura das respostas do técnico, evidências, não conformidades e histórico; decisões exigem confirmação e reprovação exige motivo.
- Gestão de usuários, clientes, locais e equipamentos com dados demonstrativos persistidos no navegador.
- Construtor de modelos com seções, itens, tipos de resposta, validação, prévia e versões publicadas.
- Não conformidades e histórico de auditoria com filtros e exportação CSV.

## Dados e permissões

As alterações ficam no `localStorage` do navegador. O login, a redefinição de acesso e os perfis simulam os fluxos da interface; não enviam e-mail nem substituem autorização no servidor. Rotas e ações da interface respeitam os perfis selecionados. Para restaurar os dados iniciais, limpe os dados locais do site.

## Tecnologias

Angular, TypeScript, Bootstrap 5, Bootstrap Icons e CSS. As rotas usam Angular Router; não há backend.
