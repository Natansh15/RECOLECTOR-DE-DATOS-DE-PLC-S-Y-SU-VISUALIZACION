import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlcComponent } from './plcip.component';

describe('PlcipComponent', () => {
  let component: PlcComponent;
  let fixture: ComponentFixture<PlcComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PlcComponent]
    });
    fixture = TestBed.createComponent(PlcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
