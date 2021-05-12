interface IBuildFailChartData {
  result: string;
  finishTime: string;
}

interface IAzureData {
  count: number;
  value: Array<IBuildFailChartData>;
}

export {
  IBuildFailChartData,
  IAzureData
};
