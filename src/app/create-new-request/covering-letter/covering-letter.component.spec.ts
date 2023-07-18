import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CoveringLetterComponent } from './covering-letter.component';
import { DatePipe } from '@angular/common';

describe('CoveringLetterComponent', () => {
  let component: CoveringLetterComponent;
  let fixture: ComponentFixture<CoveringLetterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoveringLetterComponent ],
      imports: [ RouterTestingModule ],
      providers: [DatePipe]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CoveringLetterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
