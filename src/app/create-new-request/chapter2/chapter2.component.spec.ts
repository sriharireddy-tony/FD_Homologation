import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Chapter2Component } from './chapter2.component';
import { DatePipe } from '@angular/common';

describe('Chapter2Component', () => {
  let component: Chapter2Component;
  let fixture: ComponentFixture<Chapter2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Chapter2Component ],
      imports: [ RouterTestingModule ],
      providers: [DatePipe]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Chapter2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
