import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-cuisine-item',
  templateUrl: './cuisine-item.component.html',
  styleUrls: ['./cuisine-item.component.css']
})
export class CuisineItemComponent implements OnInit {
  @Input() cuisine: {id: string, cuisineName: string};
  constructor() { }

  ngOnInit() {
  }

}
