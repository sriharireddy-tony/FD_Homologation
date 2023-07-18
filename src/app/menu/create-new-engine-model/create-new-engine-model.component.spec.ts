import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CreateNewEngineModelComponent } from './create-new-engine-model.component';
import { DatePipe } from '@angular/common';
import { MenuComponent } from '../menu.component';
import { AppComponent } from 'src/app/app.component';

describe('CreateNewEngineModelComponent', () => {
  let component: CreateNewEngineModelComponent;
  let fixture: ComponentFixture<CreateNewEngineModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateNewEngineModelComponent, MenuComponent, AppComponent],
      imports: [ RouterTestingModule ],
      providers: [DatePipe, MenuComponent, AppComponent]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateNewEngineModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
