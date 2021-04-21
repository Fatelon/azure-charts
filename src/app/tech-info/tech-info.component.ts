import { Component, Input, OnInit } from '@angular/core';
import { IChartData } from '../app.entity';

@Component({
  selector: 'app-tech-info',
  templateUrl: './tech-info.component.html',
  styleUrls: ['./tech-info.component.scss']
})
export class TechInfoComponent implements OnInit {

  @Input() currentData: IChartData;

  constructor() { }

  ngOnInit() {
  }

}
