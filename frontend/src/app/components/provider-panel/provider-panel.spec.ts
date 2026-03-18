import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderPanel } from './provider-panel';

describe('ProviderPanel', () => {
  let component: ProviderPanel;
  let fixture: ComponentFixture<ProviderPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProviderPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProviderPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
