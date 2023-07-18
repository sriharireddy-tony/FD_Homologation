import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CloneComponent } from './clone/clone.component';
import { CompletedTaskComponent } from './completed-task/completed-task.component';
import { CreateNewEngineFamilyComponent } from './menu/create-new-engine-family/create-new-engine-family.component';
import { CreateNewEngineModelComponent } from './menu/create-new-engine-model/create-new-engine-model.component';
import { CreateNewRequestComponent } from './create-new-request/create-new-request.component';
import { EngineFamilyComponent } from './engine-family/engine-family.component';
import { EngineModelComponent } from './engine-model/engine-model.component';
import { InboxComponent } from './inbox/inbox.component';
import { MenuComponent } from './menu/menu.component';
import { SavedComponent } from './saved/saved.component';
import { CreateMasterComponent } from './create-master/create-master.component';
import { ReportConfigComponent } from './report-config/report-config.component';
import { CreateMasterFormComponent } from './create-master-form/create-master-form.component';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
  { path: '', redirectTo: 'inbox', pathMatch: 'full' },
  {path: 'inbox', component: InboxComponent},
  {path: 'saved', component: SavedComponent},
  {path: 'completedTasks', component: CompletedTaskComponent},
  {path: 'dashboard', component: DashboardComponent},
  {path: 'createNewRequest', component: CreateNewRequestComponent},
  {path: 'clone', component: CloneComponent},
  {path: 'engineFamily', component: EngineFamilyComponent},
  {path: 'engineModel', component: EngineModelComponent},
  {path: 'createNewEngineFamily', component: CreateNewEngineFamilyComponent},
  {path: 'createNewEngineModel', component: CreateNewEngineModelComponent},
  {path: 'menu', component: MenuComponent},
  {path: 'createmaster', component: CreateMasterComponent},
  {path: 'reportconfig', component: ReportConfigComponent},
  {path: 'createmasterform', component: CreateMasterFormComponent},
  { path: "**", redirectTo: 'inbox'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }

export const myRoutings =[
  MenuComponent,
  InboxComponent,
  SavedComponent,
  CompletedTaskComponent
]
