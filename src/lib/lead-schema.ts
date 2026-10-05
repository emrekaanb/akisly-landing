import { z } from "zod";

export const SERVICES = [
  {
    value: "invoicing",
    label: "Fatura ve tahsilat otomasyonu",
    short: "Fatura & tahsilat",
  },
  {
    value: "appointments",
    label: "Randevu ve rezervasyon akışları",
    short: "Randevu & rezervasyon",
  },
  {
    value: "inventory",
    label: "Stok ve sipariş takibi",
    short: "Stok & sipariş",
  },
  {
    value: "customer-messaging",
    label: "Müşteri bildirimleri (e-posta / SMS)",
    short: "Müşteri bildirimleri",
  },
  {
    value: "consulting",
    label: "Emin değilim, keşif görüşmesi istiyorum",
    short: "Keşif görüşmesi",
  },
] as const;

export type ServiceValue = (typeof SERVICES)[number]["value"];

const serviceValues = SERVICES.map((s) => s.value) as [
  ServiceValue,
  ...ServiceValue[],
];

export const LIMITS = {
  nameMin: 2,
  nameMax: 80,
  emailMax: 120,
  descriptionMin: 20,
  descriptionMax: 1000,
} as const;

export const leadSchema = z.object({
  name: z
    .string({ error: "Ad soyad zorunludur." })
    .trim()
    .min(LIMITS.nameMin, `Ad soyad en az ${LIMITS.nameMin} karakter olmalı.`)
    .max(LIMITS.nameMax, `Ad soyad en fazla ${LIMITS.nameMax} karakter olabilir.`),
  email: z
    .string({ error: "E-posta zorunludur." })
    .trim()
    .min(1, "E-posta zorunludur.")
    .max(LIMITS.emailMax, `E-posta en fazla ${LIMITS.emailMax} karakter olabilir.`)
    .pipe(z.email("Geçerli bir e-posta adresi girin.")),
  service: z.enum(serviceValues, { error: "Lütfen bir hizmet seçin." }),
  description: z
    .string({ error: "Açıklama zorunludur." })
    .trim()
    .min(
      LIMITS.descriptionMin,
      `İhtiyacınızı en az ${LIMITS.descriptionMin} karakterle anlatın.`,
    )
    .max(
      LIMITS.descriptionMax,
      `Açıklama en fazla ${LIMITS.descriptionMax} karakter olabilir.`,
    ),
});

export type LeadFormInput = z.input<typeof leadSchema>;
export type LeadInput = z.output<typeof leadSchema>;
export type LeadField = keyof LeadInput;

export type LeadFieldErrors = Partial<Record<LeadField, string[]>>;

export type CreateLeadResponse =
  | { ok: true; lead: { id: number; createdAt: string } }
  | {
      ok: false;
      error: "validation" | "invalid_json" | "duplicate" | "server";
      message: string;
      fieldErrors?: LeadFieldErrors;
    };

export function serviceLabel(value: string): string {
  return SERVICES.find((s) => s.value === value)?.label ?? value;
}
