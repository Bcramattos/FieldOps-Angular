export interface Cliente {
  id: number;
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
}

export interface Local {
  id: number;
  nome: string;
  clienteId: number;
  endereco: string;
}

export interface Equipamento {
  id: number;
  nome: string;
  localId: number;
  tipo: string;
  status: string;
}

export interface ChecklistModelo {
  id: number;
  nome: string;
  descricao: string;
  qtdItens: number;
  versao: string;
  status: 'rascunho' | 'publicado';
}

export type StatusInspecao = 'Planejada' | 'Em andamento' | 'Aguardando revisão' | 'Aprovada' | 'Reprovada' | 'Cancelada';
export type Prioridade = 'baixa' | 'media' | 'alta';

export interface Inspecao {
  id: number;
  codigo: string;
  clienteId: number;
  equipamentoId: number;
  checklistModeloId: number;
  tecnico: string;
  data: string;
  prioridade: Prioridade;
  status: StatusInspecao;
  observacoes: string;
  naoConformidades: string[];
  evidencias: string[];
}

export interface Metrica {
  label: string;
  valor: number;
  classe: string;
}
