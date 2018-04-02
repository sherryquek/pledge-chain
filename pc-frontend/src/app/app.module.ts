import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { HomeComponent} from './Home/Home.component';
import { ProjectsComponent } from './Projects/Projects.component';
import { PledgesComponent } from './Pledges/Pledges.component';
import { AboutComponent } from './About/About.component';
import { CreateComponent } from './Create/Create.component';
import { ProfileComponent } from './Profile/Profile.component';
import { ProjectDetailsComponent } from './ProjectDetails/ProjectDetails.component';

const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'projects', component: ProjectsComponent},
  { path: 'pledges', component: PledgesComponent},
  { path: 'about', component: AboutComponent},
  { path: 'create', component: CreateComponent},
  { path: 'profile', component: ProfileComponent},
  { path: 'project-details', component: ProjectDetailsComponent},
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ProjectsComponent,
    PledgesComponent,
    AboutComponent,
    CreateComponent,
    ProfileComponent,
    ProjectDetailsComponent
  ],
  imports: [
    RouterModule.forRoot(
      appRoutes,
      {enableTracing: true}
    ),
    NgbModule.forRoot(),
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
