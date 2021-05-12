import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { authorization } from 'config.json';
import { IAzureData, IBuildFailChartData } from '../build-fail-chart/build-fail-chart.entity';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ChartDataEndpoints {

  constructor(private readonly httpClient: HttpClient) {}

  public getBuildFailChartData(userAuthorization): Observable<IBuildFailChartData[]> {
    const url = 'https://dev.azure.com/Juriba/Dashworks/_apis/build/builds?api-version=6.1-preview.6&sourceBranch=master&definitions=32&statusFilter=completed';
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        Authorization: authorization || userAuthorization
      })
    };
    return this.httpClient.get(url, httpOptions)
      .pipe(
        map((resault: IAzureData) =>
          resault.value
            .map(value => ({ result: value.result, finishTime: value.finishTime }))
            .filter((value, index, array) => {
              return !(index > 0 &&
                index < array.length - 1 &&
                value.result === array[index - 1].result &&
                value.result === array[index + 1].result
              );
            })
            // .reduce((newValues, val, index, values) => {
            //   return newValues;
            // }, [])
            .reverse()
        )
      );
  }

}
