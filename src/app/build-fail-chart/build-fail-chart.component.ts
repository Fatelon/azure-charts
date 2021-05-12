import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import * as Highcharts from 'highcharts';
import * as moment from 'moment';
import { IChartDateInterval } from '../app.entity';
import { ChartDataEndpoints } from '../endpoints/chart-data.endpoints';
import { BUILD_FAIL_CHART_DATASET } from './build-fail-chart.dataset';
import { IBuildFailChartData } from './build-fail-chart.entity';

@Component({
  selector: 'app-build-fail-chart',
  templateUrl: './build-fail-chart.component.html',
  styleUrls: ['./build-fail-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuildFailChartComponent implements OnInit {

  readonly chartsDataset = (BUILD_FAIL_CHART_DATASET as Array<IBuildFailChartData>);

  dateInterval: { start: Date, end: Date };
  currentDataIndex: number;
  rangeFG = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });
  downtimePeriod = 0;
  errorText = '';

  Highcharts: typeof Highcharts = Highcharts;
  chartConstructor = 'chart';
  updateFlag = false;
  oneToOneFlag = true;
  runOutsideAngular = false;
  chartOptions: Highcharts.Options = {
    title: {
      text: 'Build time dependency'
    },
    yAxis: {
      title: {
          text: 'Build time (minutes)'
      }
    },
    plotOptions: {
      area: {
        fillColor: {
            linearGradient: {
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 1
            },
            stops: [
                [0, Highcharts.getOptions().colors[0]],
                [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba') as string]
            ]
        },
        marker: {
            radius: 2
        },
        lineWidth: 1,
        states: {
            hover: {
                lineWidth: 1
            }
        },
        threshold: null
      },
      series: {
        point: {
          events: {
            mouseOver: (event) => {
              // console.log('Current data is', this.chartsDataset[event.target['index']]);
              this.currentDataIndex = event.target['index'];
              this.changeDetectorRef.detectChanges();
            }
          }
        }
      }
    }
    // legend: {

    // }
  };

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly chartDataEndpoints: ChartDataEndpoints
  ) {
    this.chartOptions.xAxis = { type: 'datetime' };
  }

  ngOnInit() {
    this.rangeFG.valueChanges
      .subscribe((value: any) => {
        if (!!value.start && !!value.end) {
          console.log(value);
          this.onChangedInterval(value);
        }
      });
    this.updateChartData(this.chartsDataset);
  }

  getData(userAuthorization) {
    this.chartDataEndpoints.getBuildFailChartData(userAuthorization).subscribe(data => {
      this.errorText = 'Updated';
      this.updateChartData(data);
    },
    err => {
      this.errorText = 'Something went wrong';
      this.changeDetectorRef.detectChanges();
    });
  }

  private updateChartData(dataSet: IBuildFailChartData[]) {
    this.chartOptions.series = this.getSeries(dataSet);
    this.dateInterval = {
      start: new Date(dataSet[0].finishTime),
      end: new Date(dataSet[dataSet.length - 1].finishTime)
    };
    this.updateFlag = true;
    this.changeDetectorRef.detectChanges();
  }

  private onChangedInterval(newInterval: IChartDateInterval) {
    this.chartOptions.xAxis = {
      type: 'datetime',
      min: newInterval.start.valueOf(),
      max: newInterval.end.valueOf()
    };
    this.setDowntimeHours(newInterval);
    this.updateFlag = true;
  }

  private readonly getSeries = (dataSet: any[]): any[] => {
    return [
      {
        name: 'Master Build Fail Time',
        data: this.datasetNormalization(dataSet),
        type: 'area'
      }
    ];
  }

  private readonly datasetNormalization = (dataSet: any[]): Array<Array<number>> => {
    return dataSet
      .map(data => (
        [
          moment(data.finishTime).valueOf(),
          data.result === 'failed' ? 0 : 1
        ]
      ));
  }

  private setDowntimeHours(dateInterval) {
    this.downtimePeriod = this.chartsDataset.reduce((downtime, data, index, array) => {
      if (
        moment(data.finishTime).isAfter(moment(dateInterval.start)) &&
        moment(dateInterval.end).isAfter(moment(data.finishTime)) &&
        index > 0 &&
        data.result === 'succeeded' &&
        array[index - 1].result === 'failed'
      ) {
        return downtime + moment(data.finishTime).diff(moment(array[index - 1].finishTime), 'minutes');
      }
      return downtime;
    }, 0);
  }

}
