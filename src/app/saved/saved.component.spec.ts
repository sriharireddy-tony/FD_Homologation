import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SavedComponent } from './saved.component';
import { DatePipe } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';

describe('SavedComponent', () => {
  let component: SavedComponent;
  let fixture: ComponentFixture<SavedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SavedComponent ],
      imports: [ RouterTestingModule, NgxPaginationModule ],
      providers: [DatePipe]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SavedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  fit('should create', () => {
    expect(component).toBeTruthy();
  });
});
