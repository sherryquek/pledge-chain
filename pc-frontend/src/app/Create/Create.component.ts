import { Component, OnInit, Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from "rxjs/Rx";
import 'rxjs/add/operator/map';
import { NgForm } from '@angular/forms';

@Injectable()

@Component({
  selector: 'app-create',
  templateUrl: './Create.component.html',
  styleUrls: ['./Create.component.css']
})

export class CreateComponent{
  // assuming that we are currently using alice's account to create a project
  u: user = "alice@foo.com"
  // In production, today's date and current time would be obtained
  t: todayDate = "2018-04-16T16:53:40.015Z"
  // In production, the projectID would be generated accordingly
  p: projectID = "011"

  constructor(private http: Http) {}

  createProjListing(form: NgForm) {
    console.log(projName.value);
    console.log(projDesc.value);
    console.log(endDate.value);
    console.log(fundEndDate.value);
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let option = new RequestOptions({ headers: headers });
    let data = JSON.stringify({
                              "$class": "org.acme.model.createProjListing",
                              "creator": "resource:org.acme.model.User#"+this.u,
                              "name": projName.value,
                              "description": projDesc.value,
                              "endDate": "2018-12-14T00:00:00.015Z",
                              "startDate": this.t,
                              "projectID": this.p,
                              "fundingTarget": fundTarget.value,
                              "fundingEndDate": "2018-04-14T11:53:40.015Z"
                            });
   return this.http.post('http://localhost:3000/api/org.acme.model.createProjListing', data, option).subscribe((response: Response) => { return response.json() })
  }
}
