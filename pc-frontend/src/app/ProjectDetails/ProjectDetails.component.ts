
import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';

@Component({
  selector: 'app-project-details',
  templateUrl: './ProjectDetails.component.html',
  styleUrls: ['./ProjectDetails.component.css']
})
export class ProjectDetailsComponent implements OnInit {
  public projId:string;
  ngOnInit() {
  }

  title = 'app works!';
  private apiUrl = 'http://localhost:3000/api/org.acme.model.ProjectListing/0002';
  data: any = {};

  constructor(private http: Http, private route: ActivatedRoute) {
    route.params.subscribe(params => { this.projId = params['projId'];});
    console.log(this.projId);
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
}
