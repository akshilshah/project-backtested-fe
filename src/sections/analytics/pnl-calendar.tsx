import { useState, useCallback } from 'react';
import useSWR from 'swr';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { TradesService } from 'src/services/trades.service';

// ----------------------------------------------------------------------

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

type PnlCalendarProps = {
  loading?: boolean;
};

export function PnlCalendar({ loading: externalLoading }: PnlCalendarProps) {
  const theme = useTheme();
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1); // 1-indexed

  // Fetch daily P&L data
  const { data, isLoading } = useSWR(
    ['daily-pnl', selectedYear, selectedMonth],
    () => TradesService.getDailyPnl(selectedYear, selectedMonth),
    { keepPreviousData: true }
  );

  const loading = externalLoading || isLoading;

  // Navigate to previous month
  const handlePrevMonth = useCallback(() => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  }, [selectedMonth]);

  // Navigate to next month
  const handleNextMonth = useCallback(() => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  }, [selectedMonth]);

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  // Get first day of month (0-6, where 0 is Sunday)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month - 1, 1).getDay();
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, pnl: null });
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = data?.dailyPnl?.find((d: any) => d.day === day);
      days.push({
        day,
        pnl: dayData?.pnl || null
      });
    }

    return days;
  };

  // Get background color based on P&L
  const getDayColor = (pnl: number | null) => {
    if (pnl === null) return 'transparent';
    if (pnl === 0) return alpha(theme.palette.grey[500], 0.08);
    if (pnl > 0) {
      // Gradient from light to dark green based on profit amount
      const intensity = Math.min(Math.abs(pnl) / 100, 1);
      return alpha(theme.palette.success.main, 0.15 + intensity * 0.25);
    }
    // Gradient from light to dark red based on loss amount
    const intensity = Math.min(Math.abs(pnl) / 100, 1);
    return alpha(theme.palette.error.main, 0.15 + intensity * 0.25);
  };

  // Format currency
  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return `$${value.toFixed(2)}`;
  };

  const calendarDays = generateCalendarDays();

  return (
    <Card>
      <CardHeader
        title="Daily P&L Calendar"
        subheader="Track your profit and loss by day"
        action={
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton onClick={handlePrevMonth} size="small">
              <Iconify icon="solar:alt-arrow-left-line-duotone" width={20} />
            </IconButton>
            <Typography variant="subtitle2" sx={{ minWidth: 140, textAlign: 'center' }}>
              {MONTHS[selectedMonth - 1]} {selectedYear}
            </Typography>
            <IconButton onClick={handleNextMonth} size="small">
              <Iconify icon="solar:alt-arrow-right-line-duotone" width={20} />
            </IconButton>
          </Stack>
        }
      />

      <Box sx={{ p: 2 }}>
        {loading ? (
          <Stack spacing={1.5}>
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
            ))}
          </Stack>
        ) : (
          <Box>
            {/* Weekday headers */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: 0.5,
                mb: 0.5
              }}
            >
              {WEEKDAYS.map((day) => (
                <Box
                  key={day}
                  sx={{
                    textAlign: 'center',
                    py: 0.5,
                    color: 'text.secondary',
                    typography: 'caption',
                    fontSize: '0.7rem',
                    fontWeight: 600
                  }}
                >
                  {day}
                </Box>
              ))}
            </Box>

            {/* Calendar grid */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: 0.5
              }}
            >
              {calendarDays.map((dayData, index) => {
                const { day, pnl } = dayData;
                const backgroundColor = getDayColor(pnl);
                const isToday =
                  day === currentDate.getDate() &&
                  selectedMonth === currentDate.getMonth() + 1 &&
                  selectedYear === currentDate.getFullYear();

                return (
                  <Box
                    key={index}
                    sx={{
                      aspectRatio: '1',
                      minHeight: 50,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 1,
                      backgroundColor,
                      border: isToday ? `2px solid ${theme.palette.primary.main}` : 'none',
                      transition: 'all 0.2s ease-in-out',
                      cursor: day && pnl !== null ? 'pointer' : 'default',
                      '&:hover': day && pnl !== null ? {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[4],
                        zIndex: 1
                      } : {},
                      position: 'relative'
                    }}
                  >
                    {day && (
                      <>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            color: pnl === null ? 'text.disabled' : 'text.primary'
                          }}
                        >
                          {day}
                        </Typography>
                        {pnl !== null && pnl !== 0 && (
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              color: pnl > 0 ? 'success.dark' : 'error.dark',
                              mt: 0.25
                            }}
                          >
                            {pnl > 0 ? '+' : ''}{formatCurrency(pnl)}
                          </Typography>
                        )}
                        {pnl === 0 && (
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 500,
                              fontSize: '0.7rem',
                              color: 'text.disabled',
                              mt: 0.25
                            }}
                          >
                            $0
                          </Typography>
                        )}
                      </>
                    )}
                  </Box>
                );
              })}
            </Box>

            {/* Legend */}
            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
              alignItems="center"
              sx={{ mt: 2, pt: 1.5, borderTop: `1px dashed ${theme.palette.divider}` }}
            >
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: 0.5,
                    backgroundColor: alpha(theme.palette.success.main, 0.3)
                  }}
                />
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                  Profit
                </Typography>
              </Stack>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: 0.5,
                    backgroundColor: alpha(theme.palette.error.main, 0.3)
                  }}
                />
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                  Loss
                </Typography>
              </Stack>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: 0.5,
                    backgroundColor: alpha(theme.palette.grey[500], 0.08)
                  }}
                />
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                  Break Even
                </Typography>
              </Stack>
            </Stack>
          </Box>
        )}
      </Box>
    </Card>
  );
}
