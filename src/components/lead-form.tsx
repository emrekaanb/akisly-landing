"use client";

import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CircleAlert, CircleCheck, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LIMITS,
  SERVICES,
  leadSchema,
  serviceLabel,
  type CreateLeadResponse,
  type LeadField,
  type LeadFormInput,
  type LeadInput,
} from "@/lib/lead-schema";
import { cn } from "@/lib/utils";

type SavedLead = { id: number; createdAt: string; service: string; email: string };

const selectItems = SERVICES.map((s) => ({ value: s.value, label: s.label }));

const emptyValues = {
  name: "",
  email: "",
  service: undefined,
  description: "",
} as unknown as LeadFormInput;

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="flex items-start gap-1.5 text-sm text-destructive">
      <CircleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      {message}
    </p>
  );
}

export function LeadForm() {
  const [saved, setSaved] = useState<SavedLead | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormInput, unknown, LeadInput>({
    resolver: zodResolver(leadSchema),
    mode: "onTouched",
    defaultValues: emptyValues,
  });

  const descriptionLength = (useWatch({ control, name: "description" }) ?? "").length;

  async function onSubmit(values: LeadInput) {
    setServerError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      const body = (await res.json().catch(() => null)) as CreateLeadResponse | null;

      if (res.status === 201 && body?.ok) {
        setSaved({ ...body.lead, service: values.service, email: values.email });
        reset(emptyValues);
        return;
      }

      if (body && !body.ok) {
        for (const [field, messages] of Object.entries(body.fieldErrors ?? {})) {
          if (messages?.length) {
            setError(field as LeadField, { type: "server", message: messages[0] });
          }
        }
        setServerError(body.message);
      } else {
        setServerError(`Sunucudan beklenmeyen bir yanıt geldi (HTTP ${res.status}). Talebiniz kaydedilmedi.`);
      }
    } catch {
      setServerError(
        "Sunucuya ulaşılamadı. Bağlantınızı kontrol edip tekrar deneyin; talebiniz kaydedilmedi.",
      );
    }
  }

  if (saved) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col items-start gap-4 rounded-2xl border border-primary/25 bg-primary/5 p-6 sm:p-8"
      >
        <span className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <CircleCheck className="size-6" aria-hidden />
        </span>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Talebiniz kaydedildi</h3>
          <p className="text-muted-foreground">
            Teşekkürler! <strong className="text-foreground">#{saved.id}</strong> numaralı talebiniz
            sunucumuza kaydedildi. Bir sonraki iş günü içinde{" "}
            <strong className="text-foreground">{saved.email}</strong> adresine dönüş yapacağız.
          </p>
        </div>
        <dl className="grid w-full gap-x-6 gap-y-2 rounded-xl bg-background p-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Hizmet</dt>
            <dd className="font-medium">{serviceLabel(saved.service)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Kayıt zamanı</dt>
            <dd className="font-medium">
              {new Date(saved.createdAt).toLocaleString("tr-TR", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </dd>
          </div>
        </dl>
        <Button variant="outline" size="lg" onClick={() => setSaved(null)}>
          Yeni bir talep gönder
        </Button>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5"
      aria-describedby={serverError ? "form-error" : undefined}
    >
      {serverError && (
        <div
          id="form-error"
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          <div>
            <p className="font-medium">Talebiniz gönderilemedi</p>
            <p className="mt-0.5 text-destructive/90">{serverError}</p>
          </div>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Ad soyad</Label>
          <Input
            id="name"
            autoComplete="name"
            placeholder="Örn. Deniz Kurgu"
            className="h-11 text-base sm:text-sm"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
            {...register("name")}
          />
          <FieldError id="name-error" message={errors.name?.message} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">E-posta</Label>
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="ornek@example.com"
            className="h-11 text-base sm:text-sm"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
          <FieldError id="email-error" message={errors.email?.message} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="service">Hangi konuda destek istiyorsunuz?</Label>
        <Controller
          control={control}
          name="service"
          render={({ field }) => (
            <Select
              items={selectItems}
              name={field.name}
              value={field.value ?? null}
              onValueChange={(value) => field.onChange(value ?? undefined)}
              onOpenChange={(open) => {
                if (!open) field.onBlur();
              }}
            >
              <SelectTrigger
                id="service"
                ref={field.ref}
                className="w-full text-base data-[size=default]:h-11 sm:text-sm"
                aria-invalid={!!errors.service}
                aria-describedby={errors.service ? "service-error" : undefined}
              >
                <SelectValue placeholder="Bir hizmet seçin" />
              </SelectTrigger>
              <SelectContent>
                {selectItems.map((item) => (
                  <SelectItem key={item.value} value={item.value} className="py-2">
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FieldError id="service-error" message={errors.service?.message} />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <Label htmlFor="description">İhtiyacınızı kısaca anlatın</Label>
          <span
            className={cn(
              "text-xs tabular-nums text-muted-foreground",
              descriptionLength > LIMITS.descriptionMax && "text-destructive",
            )}
            aria-live="polite"
          >
            {descriptionLength}/{LIMITS.descriptionMax}
          </span>
        </div>
        <Textarea
          id="description"
          rows={5}
          placeholder="Örn. Haftada 60 civarı randevuyu telefonla alıyoruz; hatırlatmaları elle gönderiyoruz ve gelmeyen müşteri oranı yüksek."
          className="min-h-32 text-base sm:text-sm"
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? "description-error" : "description-hint"}
          {...register("description")}
        />
        {errors.description ? (
          <FieldError id="description-error" message={errors.description.message} />
        ) : (
          <p id="description-hint" className="text-xs text-muted-foreground">
            En az {LIMITS.descriptionMin} karakter. Hangi işi, ne sıklıkla ve hangi araçlarla
            yaptığınızı yazmanız yeterli.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Bu bir demo formudur; lütfen yalnızca kurgusal test verisi girin.
        </p>
        <Button type="submit" size="lg" className="h-11 px-5 text-base sm:text-sm" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <LoaderCircle className="animate-spin" aria-hidden />
              Gönderiliyor…
            </>
          ) : (
            <>
              Talebi gönder
              <ArrowRight aria-hidden />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
