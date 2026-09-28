import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  IndianRupee,
  LockKeyhole,
  QrCode,
  ShieldCheck,
  Smartphone,
  WalletCards,
  X,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  Receipt,
} from 'lucide-react';

type PaymentMethod = 'upi' | 'card' | 'qr';

interface PaymentMethodModalProps {
  title: string;
  amount: number;
  orderId?: string;
  description?: string;
  onClose: () => void;
  onSuccess: (
    method: PaymentMethod,
    transactionId: string
  ) => void;
}

const formatAmount = (amount: number) =>
  `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const generateTransactionId = () => {
  return `AGR${Date.now().toString().slice(-10)}${Math.floor(
    Math.random() * 900 + 100
  )}`;
};

const formatCardNumber = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
};

const formatExpiry = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 4);

  if (digits.length <= 2) return digits;

  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

export const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
  title,
  amount,
  orderId,
  description = 'Secure payment for your AgriGo service',
  onClose,
  onSuccess,
}) => {
  const [method, setMethod] = useState<PaymentMethod>('upi');

  const [upiId, setUpiId] = useState('');
  const [selectedApp, setSelectedApp] = useState('');

  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paid, setPaid] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [copied, setCopied] = useState(false);

  const [showSummary, setShowSummary] = useState(false);

  const formattedAmount = useMemo(
    () => formatAmount(amount),
    [amount]
  );

  useEffect(() => {
    if (!paid) return;

    const timer = window.setTimeout(() => {
      onSuccess(method, transactionId);
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [paid, method, transactionId, onSuccess]);

  const validatePayment = () => {
    setError('');

    if (method === 'upi') {
      if (!selectedApp && !upiId.trim()) {
        setError('Select a UPI app or enter your UPI ID.');
        return false;
      }

      if (
        upiId.trim() &&
        !/^[\w.-]+@[\w.-]+$/.test(upiId.trim())
      ) {
        setError(
          'Enter a valid UPI ID, for example farmer@oksbi.'
        );
        return false;
      }
    }

    if (method === 'qr') {
      return true;
    }

    if (method === 'card') {
      const cleanCard = cardNumber.replace(/\s/g, '');

      if (!/^\d{16}$/.test(cleanCard)) {
        setError('Enter a valid 16-digit card number.');
        return false;
      }

      if (!cardName.trim()) {
        setError('Enter the name shown on the card.');
        return false;
      }

      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
        setError('Enter expiry in MM/YY format.');
        return false;
      }

      if (!/^\d{3,4}$/.test(cvv)) {
        setError('Enter a valid CVV.');
        return false;
      }
    }

    return true;
  };

  const submitPayment = () => {
    if (processing) return;

    if (!validatePayment()) return;

    setProcessing(true);

    const newTransactionId = generateTransactionId();

    /*
      REAL WORLD INTEGRATION:

      Replace this simulation with your payment gateway API.

      Example flow:

      1. Create order from Django backend
      2. Backend creates Razorpay/Cashfree order
      3. Open payment gateway checkout
      4. Gateway returns payment ID
      5. Backend verifies signature
      6. Backend marks order as PAID
      7. React receives success response

      NEVER send raw card/CVV information to your own backend.
    */

    window.setTimeout(() => {
      setTransactionId(newTransactionId);
      setProcessing(false);
      setPaid(true);
    }, 1800);
  };

  const copyTransactionId = async () => {
    if (!transactionId) return;

    try {
      await navigator.clipboard.writeText(transactionId);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      // Clipboard unavailable
    }
  };

  const changeMethod = (newMethod: PaymentMethod) => {
    if (processing) return;

    setMethod(newMethod);
    setError('');
    setSelectedApp('');
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-md sm:p-5">

      <div className="relative flex max-h-[94vh] w-full max-w-5xl overflow-hidden rounded-[28px] bg-white shadow-[0_30px_100px_rgba(0,0,0,0.25)]">

        {/* LEFT PAYMENT PANEL */}
        <div className="flex min-w-0 flex-1 flex-col">

          {/* HEADER */}
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-7">

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100">
                <span className="text-xl">🌱</span>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600">
                  AgriGo Payments
                </p>

                <h2 className="text-lg font-black text-slate-900">
                  Secure Checkout
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={processing}
              className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Close payment"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* SUCCESS */}
          {paid ? (
            <div className="flex flex-1 items-center justify-center overflow-y-auto p-6 sm:p-10">

              <div className="w-full max-w-md text-center">

                <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50">
                  <div className="absolute inset-2 animate-pulse rounded-full bg-emerald-100" />

                  <CheckCircle2 className="relative h-14 w-14 text-emerald-600" />
                </div>

                <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">
                  Payment Completed
                </p>

                <h3 className="mt-2 text-3xl font-black text-slate-900">
                  Payment Successful
                </h3>

                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
                  Your payment has been successfully processed.
                  Your AgriGo request is now being confirmed.
                </p>

                <div className="mt-7 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 text-left">

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-500">
                      Amount Paid
                    </span>

                    <span className="text-xl font-black text-emerald-700">
                      {formattedAmount}
                    </span>
                  </div>

                  <div className="my-4 h-px bg-emerald-100" />

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Transaction ID
                    </p>

                    <div className="mt-2 flex items-center justify-between gap-2">

                      <code className="break-all text-sm font-bold text-slate-700">
                        {transactionId}
                      </code>

                      <button
                        onClick={copyTransactionId}
                        className="shrink-0 rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-50"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>

                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Your payment is securely processed
                </div>

              </div>
            </div>
          ) : (
            <>
              {/* PAYMENT BODY */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-7">

                {/* MOBILE SUMMARY */}
                <button
                  onClick={() => setShowSummary(!showSummary)}
                  className="mb-5 flex w-full items-center justify-between rounded-2xl bg-slate-50 p-4 text-left lg:hidden"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-400">
                      PAYABLE AMOUNT
                    </p>

                    <p className="mt-1 text-lg font-black text-slate-900">
                      {formattedAmount}
                    </p>
                  </div>

                  <ChevronRight
                    className={`h-5 w-5 text-slate-400 transition ${
                      showSummary ? 'rotate-90' : ''
                    }`}
                  />
                </button>

                {showSummary && (
                  <div className="mb-5 rounded-2xl border border-slate-100 p-4 lg:hidden">
                    <p className="text-sm font-black text-slate-900">
                      {title}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {description}
                    </p>
                  </div>
                )}

                <div className="mb-6">
                  <p className="text-sm font-bold text-slate-500">
                    Choose payment method
                  </p>

                  <h1 className="mt-1 text-2xl font-black text-slate-900">
                    Pay securely with AgriGo
                  </h1>
                </div>

                {/* PAYMENT METHODS */}
                <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1">

                  <button
                    onClick={() => changeMethod('upi')}
                    className={`flex items-center justify-center gap-2 rounded-xl px-2 py-3 text-sm font-black transition ${
                      method === 'upi'
                        ? 'bg-white text-emerald-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Smartphone className="h-4 w-4" />
                    <span>UPI</span>
                  </button>

                  <button
                    onClick={() => changeMethod('card')}
                    className={`flex items-center justify-center gap-2 rounded-xl px-2 py-3 text-sm font-black transition ${
                      method === 'card'
                        ? 'bg-white text-emerald-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Card</span>
                  </button>

                  <button
                    onClick={() => changeMethod('qr')}
                    className={`flex items-center justify-center gap-2 rounded-xl px-2 py-3 text-sm font-black transition ${
                      method === 'qr'
                        ? 'bg-white text-emerald-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <QrCode className="h-4 w-4" />
                    <span>QR</span>
                  </button>

                </div>

                {/* UPI */}
                {method === 'upi' && (
                  <div className="mt-6 space-y-5">

                    <div>
                      <p className="mb-3 text-sm font-black text-slate-800">
                        Pay using UPI app
                      </p>

                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

                        {[
                          {
                            name: 'Google Pay',
                            icon: 'G',
                          },
                          {
                            name: 'PhonePe',
                            icon: 'पे',
                          },
                          {
                            name: 'Paytm',
                            icon: 'P',
                          },
                          {
                            name: 'BHIM',
                            icon: 'BH',
                          },
                        ].map((app) => (
                          <button
                            key={app.name}
                            onClick={() =>
                              setSelectedApp(app.name)
                            }
                            className={`rounded-2xl border p-3 text-center transition ${
                              selectedApp === app.name
                                ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100'
                                : 'border-slate-200 bg-white hover:border-emerald-300'
                            }`}
                          >
                            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-sm font-black text-slate-700">
                              {app.icon}
                            </div>

                            <p className="mt-2 text-[11px] font-bold text-slate-700">
                              {app.name}
                            </p>
                          </button>
                        ))}

                      </div>
                    </div>

                    <div className="relative">

                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200" />
                      </div>

                      <div className="relative flex justify-center">
                        <span className="bg-white px-3 text-xs font-bold text-slate-400">
                          OR PAY WITH UPI ID
                        </span>
                      </div>

                    </div>

                    <label className="block">
                      <span className="text-sm font-bold text-slate-700">
                        UPI ID
                      </span>

                      <div className="relative mt-2">
                        <Smartphone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                        <input
                          value={upiId}
                          onChange={(e) =>
                            setUpiId(e.target.value)
                          }
                          placeholder="farmer@oksbi"
                          autoComplete="off"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50"
                        />
                      </div>

                      <p className="mt-2 text-xs text-slate-400">
                        Example: name@bank
                      </p>
                    </label>

                  </div>
                )}

                {/* CARD */}
                {method === 'card' && (
                  <div className="mt-6 space-y-4">

                    <label className="block">
                      <span className="text-sm font-bold text-slate-700">
                        Card number
                      </span>

                      <div className="relative mt-2">
                        <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                        <input
                          inputMode="numeric"
                          value={cardNumber}
                          onChange={(e) =>
                            setCardNumber(
                              formatCardNumber(e.target.value)
                            )
                          }
                          placeholder="1234 5678 9012 3456"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-semibold tracking-wide outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50"
                        />
                      </div>
                    </label>

                    <label className="block">
                      <span className="text-sm font-bold text-slate-700">
                        Name on card
                      </span>

                      <input
                        value={cardName}
                        onChange={(e) =>
                          setCardName(e.target.value)
                        }
                        placeholder="Enter card holder name"
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50"
                      />
                    </label>

                    <div className="grid grid-cols-2 gap-3">

                      <label className="block">
                        <span className="text-sm font-bold text-slate-700">
                          Expiry
                        </span>

                        <input
                          inputMode="numeric"
                          value={expiry}
                          onChange={(e) =>
                            setExpiry(
                              formatExpiry(e.target.value)
                            )
                          }
                          placeholder="MM/YY"
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50"
                        />
                      </label>

                      <label className="block">
                        <span className="text-sm font-bold text-slate-700">
                          CVV
                        </span>

                        <input
                          type="password"
                          inputMode="numeric"
                          maxLength={4}
                          value={cvv}
                          onChange={(e) =>
                            setCvv(
                              e.target.value
                                .replace(/\D/g, '')
                                .slice(0, 4)
                            )
                          }
                          placeholder="•••"
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50"
                        />
                      </label>

                    </div>

                    <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs font-medium text-slate-500">
                      <LockKeyhole className="h-4 w-4 text-emerald-600" />
                      Card information is encrypted during checkout.
                    </div>

                  </div>
                )}

                {/* QR */}
                {method === 'qr' && (
                  <div className="mt-6">

                    <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6 text-center">

                      <div className="mx-auto flex h-52 w-52 items-center justify-center rounded-3xl bg-white p-4 shadow-sm">

                        <div className="flex h-full w-full items-center justify-center rounded-2xl border-4 border-slate-900">

                          <QrCode className="h-32 w-32 text-slate-900" />

                        </div>

                      </div>

                      <h3 className="mt-5 text-lg font-black text-slate-900">
                        Scan & Pay
                      </h3>

                      <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                        Open any UPI application and scan this QR
                        code to complete your payment.
                      </p>

                      <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-emerald-700 shadow-sm">
                        <IndianRupee className="h-4 w-4" />
                        {formattedAmount}
                      </div>

                    </div>

                  </div>
                )}

                {/* ERROR */}
                {error && (
                  <div className="mt-5 flex items-start gap-3 rounded-xl border border-rose-100 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* SECURITY */}
                <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  </div>

                  <div>
                    <p className="text-xs font-black text-slate-800">
                      Secure AgriGo Checkout
                    </p>

                    <p className="mt-1 text-[11px] leading-4 text-slate-500">
                      Payments are processed through secure payment
                      infrastructure. Your sensitive payment details
                      are protected.
                    </p>
                  </div>

                </div>

              </div>

              {/* FOOTER */}
              <div className="border-t border-slate-100 bg-white p-5 sm:px-7">

                <button
                  onClick={submitPayment}
                  disabled={processing}
                  className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-emerald-700 px-5 py-4 text-sm font-black text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
                >

                  {processing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing payment...
                    </>
                  ) : (
                    <>
                      <LockKeyhole className="h-4 w-4" />
                      Pay {formattedAmount}
                      <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </>
                  )}

                </button>

                <div className="mt-3 flex items-center justify-center gap-2 text-[11px] font-medium text-slate-400">
                  <LockKeyhole className="h-3.5 w-3.5" />
                  Secure & encrypted payment
                </div>

              </div>
            </>
          )}
        </div>

        {/* RIGHT ORDER SUMMARY */}
        <aside className="hidden w-[330px] shrink-0 border-l border-slate-100 bg-slate-50/80 lg:block">

          <div className="p-7">

            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-emerald-600" />

              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                Order Summary
              </p>
            </div>

            <h3 className="mt-5 text-xl font-black leading-tight text-slate-900">
              {title}
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {description}
            </p>

            {orderId && (
              <div className="mt-5 rounded-xl bg-white p-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Order ID
                </p>

                <p className="mt-1 break-all text-xs font-bold text-slate-700">
                  {orderId}
                </p>
              </div>
            )}

            <div className="my-7 h-px bg-slate-200" />

            <div className="space-y-4">

              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  Service amount
                </span>

                <span className="font-bold text-slate-800">
                  {formattedAmount}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  Payment processing
                </span>

                <span className="font-bold text-emerald-600">
                  Included
                </span>
              </div>

            </div>

            <div className="my-6 h-px bg-slate-200" />

            <div className="flex items-end justify-between">

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total payable
                </p>

                <p className="mt-1 text-3xl font-black text-slate-900">
                  {formattedAmount}
                </p>
              </div>

              <WalletCards className="h-7 w-7 text-emerald-600" />

            </div>

            <div className="mt-8 rounded-2xl bg-white p-4 shadow-sm">

              <div className="flex gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                </div>

                <div>
                  <p className="text-xs font-black text-slate-800">
                    Safe & secure
                  </p>

                  <p className="mt-1 text-[11px] leading-4 text-slate-500">
                    AgriGo uses secure payment infrastructure to
                    protect your transaction.
                  </p>
                </div>

              </div>

            </div>

            <div className="mt-6 space-y-3">

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Instant payment confirmation
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Digital transaction receipt
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Protected checkout
              </div>

            </div>

          </div>

        </aside>

      </div>
    </div>
  );
};