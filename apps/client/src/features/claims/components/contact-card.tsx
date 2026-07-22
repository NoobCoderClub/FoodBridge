import { CountdownTimer } from './countdown-timer';

export function ContactCard({
  addressExact,
  posterPhone,
  pickupDeadline,
}: {
  addressExact: string;
  posterPhone: string | null;
  pickupDeadline: string;
}) {
  return (
    <div className="rounded-md border border-green-300 bg-green-50 p-4">
      <p className="text-sm font-medium">Pickup details</p>
      <p className="text-sm">{addressExact}</p>
      {posterPhone ? <p className="text-sm">{posterPhone}</p> : null}
      <p className="mt-2 text-sm text-gray-600">
        Pick up within: <CountdownTimer deadline={pickupDeadline} />
      </p>
    </div>
  );
}
