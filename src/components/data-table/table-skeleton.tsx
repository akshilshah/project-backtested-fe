import type { Theme, SxProps } from '@mui/material/styles';

import Skeleton from '@mui/material/Skeleton';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

// ----------------------------------------------------------------------

type TableSkeletonProps = {
  rows?: number;
  columns?: number;
  sx?: SxProps<Theme>;
};

export function TableSkeleton({ rows = 5, columns = 5, sx }: TableSkeletonProps) {
  return (
    <>
      {[...Array(rows)].map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {[...Array(columns)].map((__, colIndex) => (
            <TableCell key={colIndex} sx={sx}>
              <Skeleton variant="text" width="100%" height={24} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

// ----------------------------------------------------------------------

type TableRowSkeletonProps = {
  columns?: number;
  sx?: SxProps<Theme>;
};

export function TableRowSkeleton({ columns = 5, sx }: TableRowSkeletonProps) {
  return (
    <TableRow>
      {[...Array(columns)].map((_, index) => (
        <TableCell key={index} sx={sx}>
          <Skeleton variant="text" width="100%" height={24} />
        </TableCell>
      ))}
    </TableRow>
  );
}
