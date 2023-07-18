import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CreateMasterFormComponent } from './create-master-form.component';
import { DatePipe } from '@angular/common';
import { MenuComponent } from '../menu/menu.component';

describe('CreateMasterFormComponent', () => {
  let component: CreateMasterFormComponent;
  let fixture: ComponentFixture<CreateMasterFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateMasterFormComponent, MenuComponent ],
      imports: [ RouterTestingModule ],
      providers: [DatePipe, MenuComponent]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateMasterFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
