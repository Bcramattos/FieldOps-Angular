import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FieldOpsStore } from '../../core/fieldops.store';
import { ResourceKind } from '../../core/fieldops.models';
import { ResourcePageController } from './resource-page.component';

@Component({ selector: 'app-clients-page', standalone: false, templateUrl: './clients-page.component.html', styleUrl: '../../theme/original/clients.css' })
export class ClientsPageComponent extends ResourcePageController { constructor(store: FieldOpsStore, @Inject(PLATFORM_ID) platformId: object) { super(store, platformId); this.kind = 'clients'; } }
@Component({ selector: 'app-equipment-page', standalone: false, templateUrl: './equipment-page.component.html', styleUrl: '../../theme/original/equipamentos.css' })
export class EquipmentPageComponent extends ResourcePageController { constructor(store: FieldOpsStore, @Inject(PLATFORM_ID) platformId: object) { super(store, platformId); this.kind = 'equipment'; } }
@Component({ selector: 'app-locations-page', standalone: false, templateUrl: './locations-page.component.html', styleUrl: '../../theme/original/locais.css' })
export class LocationsPageComponent extends ResourcePageController { constructor(store: FieldOpsStore, @Inject(PLATFORM_ID) platformId: object) { super(store, platformId); this.kind = 'locations'; } }
@Component({ selector: 'app-nonconformities-page', standalone: false, templateUrl: './nonconformities-page.component.html', styleUrl: '../../theme/original/conformidades.css' })
export class NonconformitiesPageComponent extends ResourcePageController { constructor(store: FieldOpsStore, @Inject(PLATFORM_ID) platformId: object) { super(store, platformId); this.kind = 'nonconformities'; } }
@Component({ selector: 'app-history-page', standalone: false, templateUrl: './history-page.component.html', styleUrl: '../../theme/original/historico.css' })
export class HistoryPageComponent extends ResourcePageController { constructor(store: FieldOpsStore, @Inject(PLATFORM_ID) platformId: object) { super(store, platformId); this.kind = 'history'; } }
