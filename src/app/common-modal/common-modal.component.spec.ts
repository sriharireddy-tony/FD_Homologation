import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModalComponent } from './common-modal.component';
import { DatePipe } from '@angular/common';
import { AppComponent } from '../app.component';
import * as $ from 'jquery';

describe('CommonModalComponent', () => {
  let component: CommonModalComponent;
  let fixture: ComponentFixture<CommonModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommonModalComponent, AppComponent  ],
      imports: [ RouterTestingModule ],
      providers: [ DatePipe, AppComponent]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
