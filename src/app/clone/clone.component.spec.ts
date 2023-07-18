import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CloneComponent } from './clone.component';
import { DatePipe } from '@angular/common';

describe('CloneComponent', () => {
  let component: CloneComponent;
  let fixture: ComponentFixture<CloneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CloneComponent ],
      imports: [ RouterTestingModule ],
      providers: [DatePipe]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CloneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
