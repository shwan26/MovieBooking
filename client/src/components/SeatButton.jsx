import { Button, Tooltip } from '@mui/material';
import chair from '../assets/seats/chair.png';
import check from '../assets/seats/check.png';
import account from '../assets/seats/account.png';

export default function SeatButton({ seat, seatId, selected, onClick }) {
  const isBooked = Boolean(seat?.isBooked);     // safe
  const icon = isBooked ? account : selected ? check : chair;
  const label = `${seatId}${isBooked ? ' (taken)' : selected ? ' (selected)' : ''}`;

  return (
    <Tooltip title={label}>
      <span>
        <Button
          onClick={onClick}
          disabled={isBooked}         // if seat is missing we treat as available
          variant="text"
          sx={{ minWidth: 0, p: 0.5, opacity: isBooked ? 0.7 : 1 }}
        >
          <img src={icon} alt={label} style={{ width: 36, height: 36, display: 'block' }} />
        </Button>
      </span>
    </Tooltip>
  );
}
