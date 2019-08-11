const lineOption = (data, type, dataType, mapping) => {
  const xAxisData = []
  const seriesData = []
  data.length !== 0 && data.forEach((item) => {
    xAxisData.push(item.dateTime)
    seriesData.push(item.num)
  });
  const option = {
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xAxisData,
      axisLine: {
        onZero: true,
      },
    },
    grid: {
      left: '0',
      top: '10%',
      right: '0',
      bottom: '0',
      containLabel: true,
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: mapping[type],
        type: 'line',
        areaStyle: {
          normal: {

          },
        },
        data: seriesData,
      },
    ],
  }
  return option
}
export default lineOption