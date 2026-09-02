import QRCode from "qrcode";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  MessageCircle,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import { CopyLinkButton } from "./copy-link-button";

function getWhatsAppCapabilities() {
  return {
    text: true,
    image: true,
    audio: true,
    sticker: true,
    groups: "unsupported",
    groupDiscovery: "unsupported",
  };
}

function validateWhatsAppConfig() {
  const missing = [
    ["Business Account", process.env.WHATSAPP_BUSINESS_ACCOUNT_ID],
    ["Phone Number ID", process.env.WHATSAPP_PHONE_NUMBER_ID],
    ["Access Token", process.env.WHATSAPP_ACCESS_TOKEN],
    ["Verify Token", process.env.WHATSAPP_VERIFY_TOKEN],
    ["Meta App Secret", process.env.META_APP_SECRET],
  ]
    .filter(([, value]) => !value)
    .map(([label]) => label);

  return {
    configured: missing.length === 0,
    missing,
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
  };
}

function digitsOnly(value: string | undefined): string {
  return value?.replace(/\D/g, "") ?? "";
}

async function getQrDataUrl(chatLink: string | null): Promise<string | null> {
  if (!chatLink) {
    return null;
  }

  return QRCode.toDataURL(chatLink, {
    errorCorrectionLevel: "M",
    margin: 2,
    scale: 8,
    color: {
      dark: "#111827",
      light: "#ffffff",
    },
  });
}

export default async function WhatsAppPage() {
  const config = validateWhatsAppConfig();
  const displayNumber = process.env.WHATSAPP_DISPLAY_PHONE_NUMBER;
  const chatNumber = digitsOnly(displayNumber);
  const chatLink = chatNumber ? `https://wa.me/${chatNumber}` : null;
  const qrDataUrl = await getQrDataUrl(chatLink);
  const capabilities = getWhatsAppCapabilities();

  const status = config.configured ? "Connected" : "Not Configured";
  const StatusIcon = config.configured ? CheckCircle2 : AlertTriangle;

  return (
    <main className="min-h-screen bg-background px-5 py-6 text-foreground sm:px-8">
      <header className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">WhatsApp</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Official Meta WhatsApp Cloud API connection state.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm text-muted-foreground">
          <StatusIcon className="h-4 w-4 text-primary" />
          {status}
        </div>
      </header>

      <div className="grid gap-4 py-6 xl:grid-cols-[1fr_360px]">
        <section className="rounded-lg border bg-card shadow-sm">
          <div className="border-b p-4">
            <h2 className="text-sm font-semibold">Connection</h2>
          </div>
          <div className="grid gap-0 divide-y">
            <Row label="Business Account" value={config.configured ? config.businessAccountId ?? "Configured" : "Not configured"} />
            <Row label="Connected Number" value={displayNumber || "Not configured"} />
            <Row label="Phone Number ID" value={config.configured ? config.phoneNumberId ?? "Configured" : "Not configured"} />
            <Row label="Webhook Status" value="Pending verified webhook event" />
            <Row label="Last Webhook" value="No webhook received yet" />
            <Row label="Last Incoming Message" value="No incoming message yet" />
            <Row label="Last Outgoing Message" value="No outgoing message yet" />
          </div>
        </section>

        <section className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-semibold">Scan To Chat With TOM</h2>
          </div>
          <div className="mt-5 flex aspect-square items-center justify-center rounded-lg border bg-white p-4">
            {qrDataUrl ? (
              <img alt="Scan to chat with TOM" className="h-full w-full" src={qrDataUrl} />
            ) : (
              <QrCode className="h-24 w-24 text-slate-400" />
            )}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {chatLink ? "Opens the configured TOM business chat." : "Configure the TOM business number to generate a chat QR."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {chatLink ? <CopyLinkButton value={chatLink} /> : null}
            {qrDataUrl ? (
              <a
                className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                download="tom-whatsapp-qr.png"
                href={qrDataUrl}
              >
                <Download className="h-4 w-4" />
                Download QR
              </a>
            ) : null}
          </div>
        </section>
      </div>

      <section className="rounded-lg border bg-card shadow-sm">
        <div className="border-b p-4">
          <h2 className="text-sm font-semibold">Provider Capabilities</h2>
        </div>
        <div className="grid gap-0 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          <Capability icon={MessageCircle} label="Text" value={capabilities.text ? "Supported" : "Unavailable"} />
          <Capability icon={Clock} label="Media" value="Image, audio, sticker by media ID" />
          <Capability icon={ShieldCheck} label="Group Discovery" value="Unsupported by default" />
          <Capability icon={AlertTriangle} label="WhatsApp Web QR" value="Not implemented" />
        </div>
      </section>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 p-4 sm:grid-cols-[220px_1fr] sm:gap-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="break-words text-sm">{value}</div>
    </div>
  );
}

function Capability({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MessageCircle;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 p-4">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="mt-1 text-xs text-muted-foreground">{value}</div>
      </div>
    </div>
  );
}
