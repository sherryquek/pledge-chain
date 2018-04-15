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
                              "creator": "resource:org.acme.model.User#alice@foo.com",
                              "name": projName.value,
                              "description": projDesc.value,
                              "endDate": "2018-12-14T00:00:00.015Z",
                              "startDate": "2018-04-16T16:53:40.015Z",
                              "projectID": "004",
                              "fundingTarget": fundTarget.value,
                              "fundingEndDate": "2018-04-14T11:53:40.015Z"
                            });
   return this.http.post('http://localhost:3000/api/org.acme.model.createProjListing', data, option).subscribe((response: Response) => { return response.json() })
  }
}
