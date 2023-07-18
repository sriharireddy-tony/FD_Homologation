import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { EngineFamilyComponent } from './engine-family.component';
import { DatePipe } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';

describe('EngineFamilyComponent', () => {
  let component: EngineFamilyComponent;
  let fixture: ComponentFixture<EngineFamilyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EngineFamilyComponent ],
      imports: [ RouterTestingModule, NgxPaginationModule ],
      providers: [DatePipe]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EngineFamilyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
