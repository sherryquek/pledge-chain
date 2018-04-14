import { Component, OnInit, Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from "rxjs/Rx";
import 'rxjs/add/operator/map';

@Injectable()

@Component({
  selector: 'app-update-delivery',
  templateUrl: './UpdateDelivery.component.html',
  styleUrls: ['./UpdateDelivery.component.css']
})

export class UpdateDeliveryComponent{
  title = 'app works!';
  private apiUrl = 'http://localhost:3000/api/org.acme.model.ProjectListing';
  data: any = {};

  constructor(private http: Http) {
  	console.log('Hello fellow user');
  	this.getContacts();
  	this.getData();
  }

  getData() {
  	return this.http.get(this.apiUrl)
  		.map((res: Response) => res.json())
  }

  getContacts() {
  	this.getData().subscribe(data => {
  		console.log(data);
  		this.data = data
  	})
	}

	updateProjStatus() {
	  let headers = new Headers({ 'Content-Type': 'application/json' });
	  let option = new RequestOptions({ headers: headers });
	  let data = JSON.stringify({
							  								"$class": "org.acme.model.updateProjStatus",
															  "proj": "resource:org.acme.model.ProjectListing#creator1@pledge-chain-Butter",
															  "newStatus": "Funding"
															});
	  return this.http.post('http://localhost:3000/api/org.acme.model.updateProjStatus', data, option).subscribe((response: Response) => { return response.json() })
	}
}
