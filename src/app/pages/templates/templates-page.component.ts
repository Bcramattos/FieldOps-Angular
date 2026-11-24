import { Component, inject } from '@angular/core';
import { InspectionModel, ModelChecklistItem, ModelResponseType, ModelSection } from '../../core/fieldops.models';
import { FieldOpsStore } from '../../core/fieldops.store';

@Component({ selector: 'app-templates-page', standalone: false, templateUrl: './templates-page.component.html', styleUrl: '../../theme/original/dashboard.css' })
export class TemplatesPageComponent {
  private readonly store = inject(FieldOpsStore);
  readonly models = this.store.models;
  selectedId = '';
  draft: InspectionModel | null = null;
  modalOpen = false;
  previewOpen = false;
  notice = '';
  errors: string[] = [];
  readonly responseTypes: ModelResponseType[] = ['Conforme/Não conforme', 'Sim/Não', 'Texto', 'Número', 'Seleção', 'Foto'];
  get selected(): InspectionModel | null { return this.models().find((model) => model.id === this.selectedId) ?? null; }
  get totalItems(): number { return this.models().reduce((sum, model) => sum + model.sections.reduce((sectionSum, section) => sectionSum + section.items.length, 0), 0); }
  get publishedCount(): number { return this.models().filter((model) => model.state === 'Publicado').length; }
  countItems(model: InspectionModel): number { return model.sections.reduce((sum, section) => sum + section.items.length, 0); }
  create(): void { this.selectedId = ''; this.draft = { id: this.id(), code: `MOD-${String(this.models().length + 1).padStart(3, '0')}`, title: '', description: '', category: '', state: 'Rascunho', version: 0, sections: [], versions: [], createdAt: new Date().toISOString().slice(0, 10), updatedAt: new Date().toISOString().slice(0, 10) }; this.errors = []; this.modalOpen = true; this.previewOpen = false; }
  edit(model: InspectionModel): void { this.selectedId = model.id; this.draft = JSON.parse(JSON.stringify(model)) as InspectionModel; this.draft.state = 'Rascunho'; this.errors = []; this.modalOpen = true; this.previewOpen = false; }
  addSection(): void { if (!this.draft) return; this.draft.sections.push({ id: this.id(), title: `Seção ${this.draft.sections.length + 1}`, description: '', order: this.draft.sections.length + 1, items: [] }); }
  addItem(section: ModelSection): void { section.items.push({ id: this.id(), prompt: '', responseType: 'Conforme/Não conforme', required: true, noteOnNonconformity: true, evidenceOnNonconformity: false, options: [], order: section.items.length + 1 }); }
  removeSection(index: number): void { this.draft?.sections.splice(index, 1); this.normalizeSections(); }
  removeItem(section: ModelSection, index: number): void { section.items.splice(index, 1); this.normalizeItems(section); }
  moveSection(index: number, delta: number): void { if (!this.draft) return; const target = index + delta; if (target < 0 || target >= this.draft.sections.length) return; const [item] = this.draft.sections.splice(index, 1); this.draft.sections.splice(target, 0, item); this.normalizeSections(); }
  moveItem(section: ModelSection, index: number, delta: number): void { const target = index + delta; if (target < 0 || target >= section.items.length) return; const [item] = section.items.splice(index, 1); section.items.splice(target, 0, item); this.normalizeItems(section); }
  setOptions(item: ModelChecklistItem, value: string): void { item.options = value.split(',').map((option) => option.trim()).filter(Boolean); }
  optionsValue(item: ModelChecklistItem): string { return item.options.join(', '); }
  saveDraft(): void { if (!this.draft) return; this.errors = this.validate(false); if (this.errors.some((message) => message.startsWith('Informe'))) return; this.store.saveModel(this.draft); this.selectedId = this.draft.id; this.modalOpen = false; this.notice = 'Rascunho salvo.'; }
  validateBeforePublish(): string[] { this.errors = this.validate(true); return this.errors; }
  publish(): void { if (!this.draft) return; this.errors = this.validate(true); if (this.errors.length) return; const current = this.draft; this.store.publishModel({ ...current, state: 'Rascunho' }); this.selectedId = current.id; this.modalOpen = false; this.notice = `Modelo publicado na versão ${(current.version + 1)}.`; }
  openPreview(): void { this.errors = this.validate(false); this.previewOpen = true; }
  closeEditor(): void { this.modalOpen = false; this.previewOpen = false; this.draft = null; }
  private validate(publishing: boolean): string[] { if (!this.draft) return ['Selecione um modelo.']; const messages: string[] = []; if (!this.draft.title.trim()) messages.push('Informe o título do modelo.'); if (!this.draft.description.trim()) messages.push('Informe a descrição do modelo.'); if (!this.draft.category.trim()) messages.push('Informe a categoria do modelo.'); if (publishing && !this.draft.sections.length) messages.push('Adicione ao menos uma seção.'); this.draft.sections.forEach((section, index) => { if (!section.title.trim()) messages.push(`Informe o título da seção ${index + 1}.`); if (publishing && !section.items.length) messages.push(`Adicione ao menos um item à seção “${section.title}”.`); section.items.forEach((item, itemIndex) => { if (!item.prompt.trim()) messages.push(`Preencha o item ${itemIndex + 1} da seção “${section.title}”.`); if (item.responseType === 'Seleção' && item.options.length < 2) messages.push(`Configure duas ou mais opções para “${item.prompt || `Item ${itemIndex + 1}`}”.`); }); }); return messages; }
  private normalizeSections(): void { this.draft?.sections.forEach((section, index) => section.order = index + 1); }
  private normalizeItems(section: ModelSection): void { section.items.forEach((item, index) => item.order = index + 1); }
  private id(): string { return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`; }
}
