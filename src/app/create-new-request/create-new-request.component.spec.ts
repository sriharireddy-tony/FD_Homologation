import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CreateNewRequestComponent } from './create-new-request.component';
import { DatePipe } from '@angular/common';
import { FormBuilder } from '@angular/forms';
import { MenuComponent } from '../menu/menu.component';

describe('CreateNewRequestComponent', () => {
  let component: CreateNewRequestComponent;
  let fixture: ComponentFixture<CreateNewRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateNewRequestComponent, MenuComponent ],
      imports: [ RouterTestingModule ],
      providers: [DatePipe, FormBuilder,MenuComponent]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateNewRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
