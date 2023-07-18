import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Table12Component } from './table12.component';
import { DatePipe } from '@angular/common';

describe('Table12Component', () => {
  let component: Table12Component;
  let fixture: ComponentFixture<Table12Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Table12Component ],
      imports: [ RouterTestingModule ],
      providers: [DatePipe]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Table12Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
