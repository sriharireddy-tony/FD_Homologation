import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { EngineModelComponent } from './engine-model.component';
import { DatePipe } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';

describe('EngineModelComponent', () => {
  let component: EngineModelComponent;
  let fixture: ComponentFixture<EngineModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EngineModelComponent ],
      imports: [ RouterTestingModule, NgxPaginationModule ],
      providers: [DatePipe]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EngineModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
