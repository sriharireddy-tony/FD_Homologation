import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MenuComponent } from './menu/menu.component';
import { InboxComponent } from './inbox/inbox.component';
import { SavedComponent } from './saved/saved.component';
import { CompletedTaskComponent } from './completed-task/completed-task.component';
import { myRoutings } from './app-routing.module';
import { CreateNewRequestComponent } from './create-new-request/create-new-request.component';
import { CloneComponent } from './clone/clone.component';
import { EngineFamilyComponent } from './engine-family/engine-family.component';
import { EngineModelComponent } from './engine-model/engine-model.component';
import { CreateNewEngineFamilyComponent } from './menu/create-new-engine-family/create-new-engine-family.component';
import { CreateNewEngineModelComponent } from './menu/create-new-engine-model/create-new-engine-model.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { CreateMasterComponent } from './create-master/create-master.component';
import { ReportConfigComponent } from './report-config/report-config.component';
import { CreateMasterFormComponent } from './create-master-form/create-master-form.component';
import { CommonModalComponent } from './common-modal/common-modal.component';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {AccordionModule} from 'primeng/accordion';
import { DashboardComponent } from './dashboard/dashboard.component';  
import {CalendarModule} from 'primeng/calendar';
import {AutocompleteLibModule} from 'angular-ng-autocomplete';
import { CoveringLetterComponent } from './create-new-request/covering-letter/covering-letter.component';
import { Table12Component } from './create-new-request/table12/table12.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Table4gComponent } from './create-new-request/table4g/table4g.component';
import { Chapter2Component } from './create-new-request/chapter2/chapter2.component';
import { NgxUiLoaderHttpModule, NgxUiLoaderModule } from 'ngx-ui-loader';
import { NumbersOnlyDirective } from './directives/numbers-only.directive';
import { NumbersDirective } from './directives/numbers.directive';
import { digitOnlyDirective } from './directives/3digit-only.directive';
import { TwodigitsOnlyDirective } from './directives/twodigits-only.directive';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';

@NgModule({
  declarations: [
    myRoutings,
    AppComponent,
    MenuComponent,
    InboxComponent,
    SavedComponent,
    CompletedTaskComponent,

    CreateNewRequestComponent,
    CloneComponent,
    EngineFamilyComponent,
    EngineModelComponent,
    CreateNewEngineFamilyComponent,
    CreateNewEngineModelComponent,
    CreateMasterComponent,
    ReportConfigComponent,
    CreateMasterFormComponent,
    CommonModalComponent,
    DashboardComponent,
    CoveringLetterComponent,
    Table12Component,
    Table4gComponent,
    Chapter2Component,
    NumbersOnlyDirective,
    NumbersDirective,
    digitOnlyDirective,
    TwodigitsOnlyDirective,
   
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxPaginationModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    BrowserAnimationsModule,
    ConfirmDialogModule,
    AccordionModule,
    CalendarModule,
    AutocompleteLibModule,
    DragDropModule,
    NgxUiLoaderHttpModule,
    NgxUiLoaderModule,
    ProgressSpinnerModule,
    MultiSelectModule,
    TableModule
  ],
  providers: [DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
