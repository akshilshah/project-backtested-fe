import type { ApexOptions } from 'apexcharts';
import type { TradeAnalytics } from 'src/types/trade';

import ReactApexChart from 'react-apexcharts';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type AnalyticsChartsProps = {
  analytics: TradeAnalytics | undefined;
  loading: boolean;
};

export function AnalyticsCharts({ analytics, loading }: AnalyticsChartsProps) {
  const _theme = useTheme();

  return (
    <Grid container spacing={3}>
      {/* Win/Loss Distribution */}
      <Grid size={{ xs: 12, md: 6 }}>
        <WinLossChart analytics={analytics} loading={loading} />
      </Grid>

      {/* Performance by Coin */}
      <Grid size={{ xs: 12, md: 6 }}>
        <CoinPerformanceChart analytics={analytics} loading={loading} />
      </Grid>

      {/* Performance by Strategy */}
      <Grid size={{ xs: 12, md: 6 }}>
        <StrategyPerformanceChart analytics={analytics} loading={loading} />
      </Grid>

      {/* Win Rate Comparison */}
      <Grid size={{ xs: 12, md: 6 }}>
        <WinRateComparisonChart analytics={analytics} loading={loading} />
      </Grid>
    </Grid>
  );
}

// ----------------------------------------------------------------------

type ChartProps = {
  analytics: TradeAnalytics | undefined;
  loading: boolean;
};

function WinLossChart({ analytics, loading }: ChartProps) {
  const theme = useTheme();

  const totalTrades = analytics?.closedTrades ?? 0;
  const winRate = analytics?.winRate ?? 0;
  const winTrades = Math.round((totalTrades * winRate) / 100);
  const lossTrades = totalTrades - winTrades;

  const chartOptions: ApexOptions = {
    chart: {
      type: 'donut',
      sparkline: { enabled: true },
    },
    colors: [theme.palette.success.main, theme.palette.error.main],
    labels: ['Winning Trades', 'Losing Trades'],
    stroke: { width: 0 },
    legend: {
      show: true,
      position: 'bottom',
      horizontalAlign: 'center',
      labels: { colors: theme.palette.text.secondary },
    },
    dataLabels: { enabled: false },
    tooltip: {
      fillSeriesColor: false,
      y: {
        formatter: (value: number) => `${value} trades`,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          labels: {
            show: true,
            name: { show: true },
            total: {
              show: true,
              label: 'Win Rate',
              formatter: () => `${winRate.toFixed(1)}%`,
            },
            value: {
              show: true,
              fontSize: '24px',
              fontWeight: 700,
              color: theme.palette.text.primary,
            },
          },
        },
      },
    },
  };

  if (loading) {
    return <ChartSkeleton title="Win/Loss Distribution" />;
  }

  if (totalTrades === 0) {
    return <ChartEmpty title="Win/Loss Distribution" />;
  }

  return (
    <Card>
      <CardHeader title="Win/Loss Distribution" />
      <Box sx={{ p: 3 }}>
        <ReactApexChart
          type="donut"
          series={[winTrades, lossTrades]}
          options={chartOptions}
          height={280}
        />
      </Box>
    </Card>
  );
}

// ----------------------------------------------------------------------

function CoinPerformanceChart({ analytics, loading }: ChartProps) {
  const theme = useTheme();
  const byCoin = analytics?.byCoin ?? [];

  const chartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
    },
    colors: byCoin.map((item) =>
      item.profitLoss >= 0 ? theme.palette.success.main : theme.palette.error.main
    ),
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        distributed: true,
        barHeight: '60%',
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => {
        const formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val);
        return val >= 0 ? `+${formatted}` : formatted;
      },
      style: { fontSize: '12px' },
    },
    xaxis: {
      categories: byCoin.map((item) => item.coinSymbol),
      labels: {
        style: { colors: theme.palette.text.secondary },
        formatter: (val) => {
          const num = Number(val);
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(num);
        },
      },
    },
    yaxis: {
      labels: { style: { colors: theme.palette.text.secondary } },
    },
    legend: { show: false },
    grid: {
      borderColor: alpha(theme.palette.grey[500], 0.16),
    },
    tooltip: {
      y: {
        formatter: (val: number) => {
          const formatted = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(val);
          return val >= 0 ? `+${formatted}` : formatted;
        },
      },
    },
  };

  const series = [
    {
      name: 'P&L',
      data: byCoin.map((item) => item.profitLoss),
    },
  ];

  if (loading) {
    return <ChartSkeleton title="Performance by Coin" />;
  }

  if (byCoin.length === 0) {
    return <ChartEmpty title="Performance by Coin" />;
  }

  return (
    <Card>
      <CardHeader title="Performance by Coin" subheader="P&L by cryptocurrency" />
      <Box sx={{ p: 3 }}>
        <ReactApexChart
          type="bar"
          series={series}
          options={chartOptions}
          height={280}
        />
      </Box>
    </Card>
  );
}

// ----------------------------------------------------------------------

function StrategyPerformanceChart({ analytics, loading }: ChartProps) {
  const theme = useTheme();
  const byStrategy = analytics?.byStrategy ?? [];

  const chartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
    },
    colors: byStrategy.map((item) =>
      item.profitLoss >= 0 ? theme.palette.success.main : theme.palette.error.main
    ),
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        distributed: true,
        barHeight: '60%',
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => {
        const formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val);
        return val >= 0 ? `+${formatted}` : formatted;
      },
      style: { fontSize: '12px' },
    },
    xaxis: {
      categories: byStrategy.map((item) => item.strategyName),
      labels: {
        style: { colors: theme.palette.text.secondary },
        formatter: (val) => {
          const num = Number(val);
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(num);
        },
      },
    },
    yaxis: {
      labels: { style: { colors: theme.palette.text.secondary } },
    },
    legend: { show: false },
    grid: {
      borderColor: alpha(theme.palette.grey[500], 0.16),
    },
    tooltip: {
      y: {
        formatter: (val: number) => {
          const formatted = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(val);
          return val >= 0 ? `+${formatted}` : formatted;
        },
      },
    },
  };

  const series = [
    {
      name: 'P&L',
      data: byStrategy.map((item) => item.profitLoss),
    },
  ];

  if (loading) {
    return <ChartSkeleton title="Performance by Strategy" />;
  }

  if (byStrategy.length === 0) {
    return <ChartEmpty title="Performance by Strategy" />;
  }

  return (
    <Card>
      <CardHeader title="Performance by Strategy" subheader="P&L by trading strategy" />
      <Box sx={{ p: 3 }}>
        <ReactApexChart
          type="bar"
          series={series}
          options={chartOptions}
          height={280}
        />
      </Box>
    </Card>
  );
}

// ----------------------------------------------------------------------

function WinRateComparisonChart({ analytics, loading }: ChartProps) {
  const theme = useTheme();
  const byStrategy = analytics?.byStrategy ?? [];

  const chartOptions: ApexOptions = {
    chart: {
      type: 'radialBar',
      toolbar: { show: false },
    },
    colors: [
      theme.palette.primary.main,
      theme.palette.info.main,
      theme.palette.warning.main,
      theme.palette.success.main,
      theme.palette.error.main,
    ],
    plotOptions: {
      radialBar: {
        hollow: {
          size: '30%',
        },
        track: {
          background: alpha(theme.palette.grey[500], 0.16),
        },
        dataLabels: {
          name: {
            fontSize: '14px',
            color: theme.palette.text.secondary,
          },
          value: {
            fontSize: '18px',
            fontWeight: 700,
            color: theme.palette.text.primary,
            formatter: (val) => `${val.toFixed(0)}%`,
          },
        },
      },
    },
    labels: byStrategy.slice(0, 5).map((item) => item.strategyName),
    legend: {
      show: true,
      position: 'bottom',
      horizontalAlign: 'center',
      labels: { colors: theme.palette.text.secondary },
    },
  };

  const series = byStrategy.slice(0, 5).map((item) => item.winRate);

  if (loading) {
    return <ChartSkeleton title="Win Rate by Strategy" />;
  }

  if (byStrategy.length === 0) {
    return <ChartEmpty title="Win Rate by Strategy" />;
  }

  return (
    <Card>
      <CardHeader title="Win Rate by Strategy" subheader="Win rate comparison" />
      <Box sx={{ p: 3 }}>
        <ReactApexChart
          type="radialBar"
          series={series}
          options={chartOptions}
          height={340}
        />
      </Box>
    </Card>
  );
}

// ----------------------------------------------------------------------

function ChartSkeleton({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader title={title} />
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 1 }} />
      </Box>
    </Card>
  );
}

function ChartEmpty({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader title={title} />
      <Box
        sx={{
          p: 3,
          height: 280,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Iconify
          icon={"solar:chart-bold-duotone" as any}
          width={48}
          sx={{ color: 'text.disabled', mb: 2 }}
        />
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          No data available
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
          Complete some trades to see analytics
        </Typography>
      </Box>
    </Card>
  );
}
