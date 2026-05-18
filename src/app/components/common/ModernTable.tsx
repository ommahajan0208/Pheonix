import { TableContainer, TableContainerProps } from '@mui/material';
import { ReactNode } from 'react';

interface ModernTableProps extends Omit<TableContainerProps, 'children'> {
  children: ReactNode;
}

export default function ModernTable({ children, sx, ...rest }: ModernTableProps) {
  return (
    <TableContainer
      {...rest}
      sx={{
        borderRadius: 'var(--phoenix-radius-md)',
        border: '1px solid var(--phoenix-border)',
        backgroundColor: 'var(--phoenix-surface)',
        boxShadow: 'var(--phoenix-shadow-sm)',
        '& .MuiTableRow-root:nth-of-type(even)': {
          backgroundColor: 'rgba(239, 246, 255, 0.35)',
        },
        '& .MuiTableRow-root': {
          minHeight: 72,
          transition: 'background-color var(--phoenix-transition)',
        },
        '& .MuiTableRow-root:hover': {
          backgroundColor: 'rgba(111, 178, 255, 0.16)',
        },
        '& .MuiTableCell-root': {
          borderColor: 'rgba(226, 232, 240, 0.7)',
          py: 2.25,
        },
        ...sx,
      }}
    >
      {children}
    </TableContainer>
  );
}
