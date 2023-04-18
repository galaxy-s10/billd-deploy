/**
 * @description: 计算剩余时间
 * @return {*}
 */
export function calculateRemainingTime({ startTime, endTime }) {
  const duration = endTime - startTime;
  const ms = 1;
  const second = ms * 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;
  if (duration > day) {
    const res = (duration / day).toFixed(4).split('.');
    return `${res[0]}天${Math.floor(Number(`0.${res[1]}`) * 24)}时`;
  } else if (duration > hour) {
    const res = (duration / hour).toFixed(4).split('.');
    return `${res[0]}时${Math.floor(Number(`0.${res[1]}`) * 60)}分`;
  } else if (duration > minute) {
    const res = (duration / minute).toFixed(4).split('.');
    return `${res[0]}分${Math.floor(Number(`0.${res[1]}`) * 60)}秒`;
  } else {
    const res = (duration / second).toFixed(4).split('.');
    return `${res[0]}秒`;
  }
}
