import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Table4gComponent } from './table4g.component';
import { DatePipe } from '@angular/common';

describe('Table4gComponent', () => {
  let component: Table4gComponent;
  let fixture: ComponentFixture<Table4gComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Table4gComponent ],
      imports: [ RouterTestingModule ],
      providers: [DatePipe]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Table4gComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
