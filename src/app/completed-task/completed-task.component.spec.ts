import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CompletedTaskComponent } from './completed-task.component';
import { DatePipe } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';

describe('CompletedTaskComponent', () => {
  let component: CompletedTaskComponent;
  let fixture: ComponentFixture<CompletedTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompletedTaskComponent ],
      imports: [ RouterTestingModule, NgxPaginationModule ],
      providers: [ DatePipe]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompletedTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
