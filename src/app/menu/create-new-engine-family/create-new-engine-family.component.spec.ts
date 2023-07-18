import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CreateNewEngineFamilyComponent } from './create-new-engine-family.component';
import { DatePipe } from '@angular/common';
import { MenuComponent } from '../menu.component';
import { AppComponent } from 'src/app/app.component';

describe('CreateNewEngineFamilyComponent', () => {
  let component: CreateNewEngineFamilyComponent;
  let fixture: ComponentFixture<CreateNewEngineFamilyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateNewEngineFamilyComponent, MenuComponent, AppComponent],
      imports: [ RouterTestingModule ],
      providers: [DatePipe, MenuComponent, AppComponent]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateNewEngineFamilyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
