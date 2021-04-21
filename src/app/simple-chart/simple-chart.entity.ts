interface ITriggerInfo {
  'pr.sourceBranch': string;
  'pr.sourceSha': string;
  'pr.title': string;
  'pr.sender.name': string;
}

interface IChartData {
  Id: number;
  triggerInfo: ITriggerInfo;
  buildNumber: string;
  result: string;
  startTime: string;
  finishTime: string;
  totalTime: string;
  reason: string;
}

export {
  IChartData,
  ITriggerInfo
};
