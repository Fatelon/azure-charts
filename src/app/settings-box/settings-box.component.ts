import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-settings-box',
  templateUrl: './settings-box.component.html',
  styleUrls: ['./settings-box.component.scss']
})
export class SettingsBoxComponent implements OnInit {

  @Input() initalChartType = 'column';

  @Output() changedChartType = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() {
  }

  onChangedChartType(event) {
    this.changedChartType.emit(event.value);
  }

}
