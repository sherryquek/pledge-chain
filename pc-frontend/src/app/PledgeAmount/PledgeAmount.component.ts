import { Component, EventEmitter, Output, Input, OnInit, Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { ActivatedRoute, Params } from '@angular/router';
import { Observable } from "rxjs/Rx";
import { NgForm } from '@angular/forms';
import 'rxjs/add/operator/map';

@Injectable()

@Component({
  selector: 'app-pledge-amount',
  templateUrl: './PledgeAmount.component.html',
  styleUrls: ['./PledgeAmount.component.css']
})
export class PledgeAmountComponent{

  public referenceID:string;

  title = 'app works!';
  private apiUrl = 'http://localhost:3000/api/org.acme.model.Pledge';
  data: any = {};

  constructor(private http: Http, private route: ActivatedRoute) {
  	route.params.subscribe(params => { this.referenceID = params['referenceID'];});
    console.log(this.referenceID);
  	console.log('Look for this');
  	this.getContacts(this.referenceID);
  	this.getData(this.referenceID);
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

  requestPledge(form: NgForm) {
		let headers = new Headers({ 'Content-Type': 'application/json' });
		let option = new RequestOptions({ headers: headers });
		let data = JSON.stringify({
									"$class": "org.acme.model.requestPledge",
								  "template": "resource:org.acme.model.PledgeTemplate#" + this.referenceID,
								  "user": "resource:org.acme.model.User#alice@foo.com",
								  "amountPledged": amount.value
               });
		return this.http.post('http://localhost:3000/api/org.acme.model.requestPledge', data, option).subscribe((response: Response) => { return response.json() })
	}
}
