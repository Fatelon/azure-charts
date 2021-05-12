import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import * as moment from 'moment';
import { Observable, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IChartData, IChartDateInterval } from '../app.entity';
import { CHARTS_DATASET } from './simple-chart.dataset';

@Component({
  selector: 'app-simple-chart',
  templateUrl: './simple-chart.component.html',
  styleUrls: ['./simple-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SimpleChartComponent implements OnInit, OnDestroy {

  private readonly destroy$ = new Subject();

  readonly chartsDataset = (CHARTS_DATASET as Array<IChartData>).reverse(); // reverse !!!
  chartsDataset$: Observable<Array<IChartData>> = of(this.chartsDataset);
  dateInterval: { start: Date, end: Date };
  currentDataIndex: number;

  Highcharts: typeof Highcharts = Highcharts;
  chartConstructor = 'chart';
  initalChartType = 'line'; // line, column, bar
  updateFlag = false;
  oneToOneFlag = true;
  runOutsideAngular = false;
  chartOptions: Highcharts.Options = {
    chart: {
      type: this.initalChartType,
    },
    title: {
      text: 'Build time dependency'
    },
    yAxis: {
      title: {
          text: 'Build time (minutes)'
      }
    },
    plotOptions: {
      series: {
        point: {
          events: {
            mouseOver: (event) => {
              console.log('Current data is', this.chartsDataset[event.target['index']]);
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

  constructor(private readonly changeDetectorRef: ChangeDetectorRef) {
    this.initChart();
  }

  ngOnInit() {
  }

  initChart() {
    this.chartOptions.xAxis = { type: 'datetime' };
    this.chartsDataset$.pipe(takeUntil(this.destroy$))
      .subscribe((chartsDataset: IChartData[]) => {
        this.chartOptions.series = this.getSeries(chartsDataset);
        this.dateInterval = {
          start: new Date(chartsDataset[0].startTime),
          end: new Date(chartsDataset[chartsDataset.length - 1].startTime)
        };
      });
  }

  chartCallback: Highcharts.ChartCallbackFunction = (chart) => {};

  onChangedChartType(newType: string) {
    this.chartOptions.chart.type = newType;
    this.updateFlag = true;
  }

  onChangedInterval(newInterval: IChartDateInterval) {
    this.chartOptions.xAxis = {
      type: 'datetime',
      min: newInterval.start.valueOf(),
      max: newInterval.end.valueOf()
    };
    this.updateFlag = true;
  }

  private readonly getSeries = (dataSet: IChartData[]): any[] => {
    return [
      {
        name: 'Master Build Time',
        data: this.datasetNormalization(dataSet)
      }
    ];
  }

  private readonly datasetNormalization = (dataSet: IChartData[]): Array<Array<number>> => {
    return dataSet
      .map(data => (
        [
          moment(data.startTime).valueOf(),
          this.getMinutesDuration(data)
        ]
      ));
  }

  private readonly getMinutesDuration = (data: any): number => {
    return moment(data.finishTime).diff(moment(data.startTime), 'minutes');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
