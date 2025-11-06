// src/components/_tests_/Payment.dataflow.test.jsx
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, beforeEach, afterEach, vi, expect } from 'vitest';
import axios from 'axios';
import PaymentPage from '../../pages/PaymentPage.jsx';

vi.mock('axios');

function renderAt(path = '/payment/b1') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/payment/:bookingId" element={<PaymentPage />} />
        <Route path="/confirmation/:id" element={<div>RECEIPT PAGE</div>} />
      </Routes>
    </MemoryRouter>
  );
}

// ---------- fixtures ----------
const bookingFixture = {
  booking: {
    _id: 'b1',
    showId: 's1',
    seats: ['A1', 'A2', 'J5', 'J6'],
    seatTypeMap: { J5: 'honeymoon', J6: 'honeymoon' },
  },
};

const showFixture = {
  _id: 's1',
  date: '2025-01-01',
  time: '18:00',
  theatre: 1,
  format: '2D',
  movieTitle: 'Inception',
};

// ---------- helpers ----------
async function stubLoad(booking = bookingFixture, show = showFixture) {
  axios.get
    .mockResolvedValueOnce({ data: booking }) // /bookings/:id
    .mockResolvedValueOnce({ data: show });   // /shows/:showId
}

async function waitForForm() {
  await screen.findByText(/Add-ons, Contact & Payment/i);
}

async function fillContact() {
  await waitForForm();
  await userEvent.type(screen.getByLabelText(/email/i), 'a@b.com');
  await userEvent.type(screen.getByLabelText(/phone/i), '0899999999');
}

async function switchToCard() {
  await waitForForm();
  const btn = screen.getByRole('button', { name: /credit\s*\/\s*debit card/i });
  await userEvent.click(btn);
}

async function fillValidCard() {
  await waitForForm();
  await userEvent.type(screen.getByLabelText(/name on card/i), 'John Doe');
  await userEvent.type(screen.getByLabelText(/card number/i), '4242 4242 4242 4242');
  await userEvent.type(screen.getByLabelText(/expiry/i), '12/30');
  await userEvent.type(screen.getByLabelText(/cvc/i), '123');
}

describe('PaymentPage (Data Flow)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // IMPORTANT: do NOT use fake timers here — they break findBy* waiting.
  });

  afterEach(() => {
    cleanup();
  });

  it(
    'Load Booking Summary: shows correct summary/total',
    async () => {
      await stubLoad();
      renderAt();

      await waitForForm();
      expect(screen.getByText(/Inception/i)).toBeInTheDocument();
      // 2 normal + 2 honeymoon = 1300; promo -100 (4 seats) = 1200
      expect(screen.getByText(/Total:\s*1200\s*THB/i)).toBeInTheDocument();
    },
    15000
  );

  it(
    'Wallet/QR Payment – Success: click "I’ve paid" → Pay → navigates to Receipt',
    async () => {
      await stubLoad();
      axios.post.mockResolvedValueOnce({ data: { booking: { _id: 'b1' } } });

      renderAt();
      await fillContact();

      const ivePaid = await screen.findByRole('button', { name: /i’ve paid/i });
      await userEvent.click(ivePaid);

      const payBtn = screen.getByRole('button', { name: /pay/i });
      expect(payBtn).not.toBeDisabled();

      await userEvent.click(payBtn);
      expect(await screen.findByText(/RECEIPT PAGE/i)).toBeInTheDocument();
    },
    15000
  );

  it(
    'Card Payment – Success (no 3DS): valid card → approved → navigates to Receipt',
    async () => {
      await stubLoad();
      axios.post.mockResolvedValueOnce({ data: { booking: { _id: 'b1' } } });

      renderAt();
      await fillContact();
      await switchToCard();
      await fillValidCard();

      const payBtn = screen.getByRole('button', { name: /pay/i });
      expect(payBtn).not.toBeDisabled();

      await userEvent.click(payBtn);
      expect(await screen.findByText(/RECEIPT PAGE/i)).toBeInTheDocument();
    },
    15000
  );

  it(
    'Card Validation Error: invalid card keeps button disabled; no attempt',
    async () => {
      await stubLoad();
      renderAt();
      await fillContact();
      await switchToCard();

      // Enter invalid data to keep validation false
      await userEvent.type(screen.getByLabelText(/name on card/i), 'A');
      await userEvent.type(screen.getByLabelText(/card number/i), '4111');
      await userEvent.type(screen.getByLabelText(/expiry/i), '13/99');
      await userEvent.type(screen.getByLabelText(/cvc/i), '12');

      const payBtn = screen.getByRole('button', { name: /pay/i });
      expect(payBtn).toBeDisabled();
      expect(axios.post).not.toHaveBeenCalled();
    },
    15000
  );

  it(
    'Gateway Decline: valid card but server rejects → error banner; stay on Payment',
    async () => {
      await stubLoad();
      axios.post.mockRejectedValueOnce({ response: { data: { error: 'Declined' } } });

      renderAt();
      await fillContact();
      await switchToCard();
      await fillValidCard();

      await userEvent.click(screen.getByRole('button', { name: /pay/i }));

      expect(await screen.findByText(/declined/i)).toBeInTheDocument();
      expect(screen.queryByText(/RECEIPT PAGE/i)).toBeNull();
    },
    15000
  );

  it(
    'Time/Amount Guard Blocks Payment: server expired/mismatch → show error; remain',
    async () => {
      await stubLoad();
      axios.post.mockRejectedValueOnce({ response: { data: { error: 'Payment window expired' } } });

      renderAt();
      await fillContact();

      const ivePaid = await screen.findByRole('button', { name: /i’ve paid/i });
      await userEvent.click(ivePaid);

      await userEvent.click(screen.getByRole('button', { name: /pay/i }));
      expect(await screen.findByText(/payment window expired/i)).toBeInTheDocument();
      expect(screen.queryByText(/RECEIPT PAGE/i)).toBeNull();
    },
    15000
  );
});
