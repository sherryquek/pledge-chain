import { Component, EventEmitter, Output, Input, OnInit, Injectable} from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-add-pledge-type',
  templateUrl: './AddPledgeType.component.html',
  styleUrls: ['./AddPledgeType.component.css']
})
export class AddPledgeTypeComponent {
  // assuming that we are currently using alice's account to create a project
  u: user = "alice@foo.com"

	public projId:string;

  title = 'app works!';
  private apiUrl = 'http://localhost:3000/api/org.acme.model.ProjectListing/';
  data: any = {};

  constructor(private http: Http, private route: ActivatedRoute) {
    route.params.subscribe(params => { this.projId = params['projId'];});
    console.log(this.projId);
  	console.log('Hello fellow user');
  	this.getContacts(this.projId);
  	this.getData(this.projId);
  }

  getData(projId:String) {
  	return this.http.get(this.apiUrl+projId)
  		.map((res: Response) => res.json())
  }

  getContacts(projId:String) {
  	this.getData(projId).subscribe(data => {
  		console.log(data);
  		this.data = data
  	})
  }

  createTemplate (form: NgForm) {
   console.log(minamt.value);
   console.log(limit.value);
   console.log(entitlement.value);
   console.log(compensation.value);
   console.log(this.projId);

   let headers = new Headers({ 'Content-Type': 'application/json' });
   let option = new RequestOptions({ headers: headers });
   let data = JSON.stringify({
                "$class": "org.acme.model.addTemplate",
							  "proj": "resource:org.acme.model.ProjectListing#"+this.projId,
								"user": "resource:org.acme.model.User#"+this.u,
							  "minAmount": minamt.value,
							  "entitlement": entitlement.value,
							  "limit": limit.value,
							  "compensation": compensation.value
                            });
   return this.http.post('http://localhost:3000/api/org.acme.model.addTemplate', data, option).subscribe((response: Response) => { return response.json() })
   }
}
