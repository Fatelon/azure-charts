import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { IChartData, IChartDateInterval } from '../app.entity';

@Component({
  selector: 'app-settings-box',
  templateUrl: './settings-box.component.html',
  styleUrls: ['./settings-box.component.scss']
})
export class SettingsBoxComponent implements OnInit {

  @Input() initalChartType = 'column';

  @Input() dateInterval: IChartDateInterval;

  @Input() currentData: IChartData;

  @Output() changedChartType = new EventEmitter<string>();
  @Output() changedInterval = new EventEmitter<IChartDateInterval>();

  rangeFG = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });

  constructor() { }

  ngOnInit() {
    this.rangeFG.valueChanges
      .subscribe((value: IChartDateInterval) => {
        if (!!value.start && !!value.end) {
          this.changedInterval.emit(value);
        }
      });
  }

  onChangedChartType(event) {
    this.changedChartType.emit(event.value);
  }

}
