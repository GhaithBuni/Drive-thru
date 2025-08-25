import Link from "next/link";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Link
        href="/kiosk"
        className="text-blue-500 hover:underline text-lg font-medium"
      >
        Go to Kiosk
      </Link>
    </div>
  );
}
