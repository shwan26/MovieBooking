// src/components/SeatButton.jsx
import { Tooltip, IconButton } from '@mui/material';

export default function SeatButton({ seat, seatId, selected, onClick, type = 'normal', price }) {
  const isBooked = seat?.isBooked;
  const label = `${seatId} • ${type === 'honeymoon' ? 'Honeymoon' : 'Normal'} • ${price} THB`;

  // Color coding: normal uses "primary", honeymoon uses "secondary"
  const palette = type === 'honeymoon' ? 'secondary' : 'primary';

  return (
    <Tooltip title={label} arrow>
      <span>
        <IconButton
          size="small"
          onClick={onClick}
          disabled={!!isBooked}
          sx={{
            width: 34, height: 34, borderRadius: 1,
            border: theme => `2px solid ${selected
              ? theme.palette[palette].main
              : theme.palette.action.disabledBackground}`,
            bgcolor: theme => selected
              ? theme.palette[palette].main
              : theme.palette.action.selected,
            color: theme => selected ? theme.palette.getContrastText(theme.palette[palette].main) : 'inherit',
            opacity: isBooked ? 0.35 : 1,
            '&:hover': {
              bgcolor: theme => theme.palette[palette].main,
              color: theme => theme.palette.getContrastText(theme.palette[palette].main),
            },
          }}
        />
      </span>
    </Tooltip>
  );
}
