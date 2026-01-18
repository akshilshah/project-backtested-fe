import type { ApexOptions } from 'apexcharts';
import type { TradeAnalytics } from 'src/types/trade';

import ReactApexChart from 'react-apexcharts';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';

// ----------------------------------------------------------------------

type TradeDurationAnalysisProps = {
  analytics: TradeAnalytics | undefined;
  loading: boolean;
};

export function TradeDurationAnalysis({ analytics, loading }: TradeDurationAnalysisProps) {
  const theme = useTheme();

  const byDuration = analytics?.byDuration;

  // Prepare data for chart
  const categories = ['0-30 Min', '30 Min - 24 Hr', '1-7 Days', '1-4 Weeks', '4+ Weeks'];
  const data = byDuration
    ? [
        byDuration['0-30mins'],
        byDuration['30mins-24hours'],
        byDuration['1-7days'],
        byDuration['1-4weeks'],
        byDuration['4weeks+'],
      ]
    : [0, 0, 0, 0, 0];

  const chartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '60%',
        distributed: true,
      },
    },
    colors: [
      theme.palette.error.main,
      theme.palette.warning.main,
      theme.palette.info.main,
      theme.palette.success.main,
      theme.palette.primary.main,
    ],
    xaxis: {
      categories,
      labels: {
        style: {
          colors: theme.palette.text.secondary,
          fontSize: '12px',
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          colors: theme.palette.text.secondary,
          fontSize: '12px',
        },
        formatter: (value) => Math.round(value).toString(),
      },
      title: {
        text: 'Number of Trades',
        style: {
          color: theme.palette.text.secondary,
          fontSize: '12px',
          fontWeight: 500,
        },
      },
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
    },
    dataLabels: {
      enabled: true,
      style: {
        colors: ['#fff'],
        fontSize: '12px',
        fontWeight: 700,
      },
      formatter: (value) => Math.round(value as number).toString(),
    },
    tooltip: {
      y: {
        formatter: (value) => `${Math.round(value)} trades`,
      },
      theme: theme.palette.mode,
    },
    legend: {
      show: false,
    },
  };

  const chartSeries = [
    {
      name: 'Trades',
      data,
    },
  ];

  return (
    <Card>
      <CardHeader
        title="Trade Duration Analysis"
        subheader="Breakdown of trades by holding period"
      />

      <Box sx={{ p: 3, pt: 0 }}>
        {loading ? (
          <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 1 }} />
        ) : (
          <ReactApexChart
            type="bar"
            series={chartSeries}
            options={chartOptions}
            height={320}
          />
        )}
      </Box>
    </Card>
  );
}
