import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Paso2 } from './paso2';

describe('Paso2', () => {
  let component: Paso2;
  let fixture: ComponentFixture<Paso2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Paso2]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Paso2);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
