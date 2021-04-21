import { Component, OnDestroy, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import * as moment from 'moment';
import { Observable, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CHARTS_DATASET } from './simple-chart.daraset';
import { IChartData } from './simple-chart.entity';

@Component({
  selector: 'app-simple-chart',
  templateUrl: './simple-chart.component.html',
  styleUrls: ['./simple-chart.component.scss'],
	// changeDetection: ChangeDetectionStrategy.OnPush
})
export class SimpleChartComponent implements OnInit, OnDestroy {

  private readonly destroy$ = new Subject();

  chartsDataset$: Observable<IChartData[]> = of(CHARTS_DATASET);

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
    // legend: {

    // }
  };

  constructor() {
    this.initChart();
  }

  ngOnInit() {
  }

  initChart() {
    this.chartOptions.xAxis = { type: 'datetime' };
    this.chartsDataset$.pipe(takeUntil(this.destroy$))
      // tslint:disable-next-line: deprecation
      .subscribe((chartsDataset: IChartData[]) => {
        this.chartOptions.series = this.getSeries(chartsDataset);
      });
  }

  chartCallback: Highcharts.ChartCallbackFunction = (chart) => {};

  onChangedChartType(newType: string) {
    console.log('newType', newType);
    this.chartOptions.chart.type = newType;
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
      ))
      .reverse();
  }

  private readonly getMinutesDuration = (data: any): number => {
    return moment(data.finishTime).diff(moment(data.startTime), 'minutes');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
