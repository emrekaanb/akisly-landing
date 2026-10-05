import {
  ArrowRight,
  BellRing,
  Boxes,
  Briefcase,
  CalendarClock,
  CircleCheck,
  Clock,
  Compass,
  FileSpreadsheet,
  MessageSquareWarning,
  Receipt,
  ShieldCheck,
  Stethoscope,
  Store,
  UtensilsCrossed,
  Workflow,
  Zap,
} from "lucide-react";
import { LeadForm } from "@/components/lead-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const painPoints = [
  {
    icon: FileSpreadsheet,
    title: "Aynı veriyi üç yere giriyorsunuz",
    text: "Sipariş e-postadan Excel'e, oradan muhasebe programına elle taşınıyor. Her kopyalama yeni bir hata ihtimali.",
  },
  {
    icon: Clock,
    title: "Akşamlar evrak işine gidiyor",
    text: "Fatura kesmek, ödeme hatırlatmak, randevu teyit etmek… Gün içinde yetişmeyen işler mesai sonrasına kalıyor.",
  },
  {
    icon: MessageSquareWarning,
    title: "Müşteri unutulunca iş kaçıyor",
    text: "Teyit edilmeyen randevular, geç giden teklifler ve cevapsız kalan talepler sessizce gelir kaybına dönüşüyor.",
  },
];

const audiences = [
  { icon: Store, title: "Butik ve yerel mağazalar", text: "Stok, sipariş ve kargo bildirimleri" },
  { icon: Stethoscope, title: "Klinik ve salonlar", text: "Randevu, hatırlatma ve iptal yönetimi" },
  { icon: Briefcase, title: "Ofis ve ajanslar", text: "Teklif, fatura ve tahsilat takibi" },
  { icon: UtensilsCrossed, title: "Kafe ve restoranlar", text: "Tedarikçi siparişi ve rezervasyonlar" },
];

const services = [
  {
    icon: Receipt,
    title: "Fatura ve tahsilat",
    text: "Tamamlanan işten otomatik fatura taslağı, vadesi yaklaşan ödemeler için nazik hatırlatmalar.",
  },
  {
    icon: CalendarClock,
    title: "Randevu ve rezervasyon",
    text: "Online randevu, otomatik teyit ve gün öncesi hatırlatma ile boş kalan saatleri azaltın.",
  },
  {
    icon: Boxes,
    title: "Stok ve sipariş",
    text: "Kritik seviyeye düşen ürün için uyarı, tedarikçiye hazır sipariş listesi.",
  },
  {
    icon: BellRing,
    title: "Müşteri bildirimleri",
    text: "Sipariş durumu, kargo ve memnuniyet anketlerini doğru zamanda e-posta veya SMS ile gönderin.",
  },
];

const steps = [
  {
    title: "Talebinizi bırakın",
    text: "Formda hangi işin sizi yorduğunu birkaç cümleyle anlatın. Teknik bilgi gerekmez.",
  },
  {
    title: "30 dakikalık keşif görüşmesi",
    text: "Mevcut araçlarınızı ve iş akışınızı birlikte inceler, ilk otomatikleştirilecek adımı seçeriz.",
  },
  {
    title: "Kurulum ve takip",
    text: "Akışı kurar, ekibinizle test ederiz. İlk ay boyunca haftalık kontrolle ince ayar yaparız.",
  },
];

const faqs = [
  {
    q: "Akışly gerçek bir şirket mi?",
    a: "Hayır. Akışly, bir demo projesi için oluşturulmuş kurgusal bir hizmettir. Bu sayfa ticari amaçla kullanılmaz; formu yalnızca kurgusal test verisiyle doldurun.",
  },
  {
    q: "Yeni bir yazılım öğrenmemiz gerekecek mi?",
    a: "Senaryomuzda hayır: Akışly, kullandığınız e-posta, takvim ve tablo araçlarının arasına kurulur. Ekibiniz alışık olduğu ekranlarda çalışmaya devam eder.",
  },
  {
    q: "Gönderdiğim form bilgileri nereye gidiyor?",
    a: "Form verileri bu demo uygulamanın sunucusundaki yerel bir SQLite dosyasına kaydedilir. Üçüncü taraf bir servise gönderilmez ve pazarlama amacıyla kullanılmaz.",
  },
  {
    q: "Hangi hizmeti seçeceğimden emin değilim.",
    a: "Formda “Emin değilim, keşif görüşmesi istiyorum” seçeneğini işaretleyin ve yaşadığınız sorunu anlatın; doğru başlangıç noktasını birlikte belirleriz.",
  },
];

function SectionHeading({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-semibold tracking-wide text-primary uppercase">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        {title}
      </h2>
      {text && <p className="mt-4 text-pretty text-muted-foreground sm:text-lg">{text}</p>}
    </div>
  );
}

function FlowPreview() {
  const rows = [
    { label: "Yeni randevu talebi alındı", meta: "09:12 · web formu", done: true },
    { label: "Takvime eklendi, teyit e-postası gitti", meta: "09:12 · otomatik", done: true },
    { label: "Gün öncesi SMS hatırlatması", meta: "yarın 10:00 · planlandı", done: false },
    { label: "Ziyaret sonrası memnuniyet anketi", meta: "ziyaretten 2 saat sonra", done: false },
  ];
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/20 via-primary/5 to-transparent blur-2xl"
      />
      <div className="rounded-2xl border bg-card p-5 shadow-xl shadow-primary/5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Workflow className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-semibold">Randevu akışı</p>
              <p className="text-xs text-muted-foreground">Örnek senaryo · Kurgu Güzellik Salonu</p>
            </div>
          </div>
          <Badge variant="secondary" className="shrink-0">
            <Zap aria-hidden /> Aktif
          </Badge>
        </div>
        <ol className="mt-5 space-y-3">
          {rows.map((row) => (
            <li key={row.label} className="flex items-start gap-3 rounded-xl border bg-background p-3">
              <span
                className={
                  row.done
                    ? "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
                    : "mt-0.5 size-5 shrink-0 rounded-full border-2 border-dashed border-primary/40"
                }
              >
                {row.done && <CircleCheck className="size-3.5" aria-hidden />}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium">{row.label}</p>
                <p className="text-xs text-muted-foreground">{row.meta}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-4 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
          Bu akışta personelin yaptığı tek şey: randevu saatinde müşteriyi karşılamak.
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <a href="#" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Workflow className="size-4.5" aria-hidden />
            </span>
            Akışly
          </a>
          <nav aria-label="Sayfa içi" className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#kimler-icin" className="hover:text-foreground">Kimler için</a>
            <a href="#hizmetler" className="hover:text-foreground">Hizmetler</a>
            <a href="#nasil-calisir" className="hover:text-foreground">Nasıl çalışır</a>
            <a href="#sss" className="hover:text-foreground">SSS</a>
          </nav>
          <Button nativeButton={false} render={<a href="#talep" />} className="h-9 px-3.5">
            Talep oluştur
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(ellipse_at_top,var(--color-primary)/0.12,transparent_65%)]"
          />
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:py-24">
            <div>
              <Badge variant="outline" className="mb-5 h-auto gap-1.5 bg-background px-2.5 py-1 text-xs">
                <ShieldCheck className="text-primary" aria-hidden />
                Kurgusal demo · Ticari değildir
              </Badge>
              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                Tekrarlayan işleri Akışly&apos;ye bırakın, siz işinize odaklanın.
              </h1>
              <p className="mt-5 max-w-xl text-lg text-pretty text-muted-foreground">
                Akışly, 1–50 çalışanlı küçük işletmeler için fatura, randevu, stok ve müşteri
                bildirimlerini otomatikleştiren bir kurulum ve destek hizmetidir. Yeni bir yazılım
                öğretmeyiz; mevcut araçlarınızı birbirine bağlarız.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  nativeButton={false}
                  render={<a href="#talep" />}
                  size="lg"
                  className="h-12 px-6 text-base"
                >
                  Ücretsiz keşif görüşmesi isteyin
                  <ArrowRight aria-hidden />
                </Button>
                <Button
                  nativeButton={false}
                  render={<a href="#nasil-calisir" />}
                  size="lg"
                  variant="outline"
                  className="h-12 px-6 text-base"
                >
                  Nasıl çalışır?
                </Button>
              </div>
              <ul className="mt-8 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                {["Kurulum 2 haftada", "Kod bilgisi gerekmez", "İlk ay haftalık takip"].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <CircleCheck className="size-4 text-primary" aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <FlowPreview />
          </div>
        </section>

        {/* Problem */}
        <section className="border-y bg-muted/40 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHeading
              eyebrow="Sorun"
              title="Küçük ekipler, büyük evrak yükü"
              text="Küçük işletmelerde aynı kişi hem satış yapar hem fatura keser hem müşteriye döner. Zaman, en pahalı kaynak haline gelir."
            />
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {painPoints.map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-2xl border bg-card p-6">
                  <Icon className="size-6 text-primary" aria-hidden />
                  <h3 className="mt-4 font-semibold">{title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Audience */}
        <section id="kimler-icin" className="py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHeading
              eyebrow="Kimler için"
              title="Günlük operasyonu elle yürüten işletmeler"
              text="Ayrı bir IT ekibiniz yoksa ve işlerin çoğu e-posta, telefon ve tablolar üzerinden dönüyorsa Akışly tam size göre."
            />
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {audiences.map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex items-start gap-4 rounded-2xl border p-5">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services */}
        <section id="hizmetler" className="border-y bg-muted/40 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHeading
              eyebrow="Hizmetler"
              title="Dört akış, tek kurulum ekibi"
              text="İhtiyacınız olan akışla başlayın; işletmeniz büyüdükçe yenilerini ekleyin."
            />
            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              {services.map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex gap-4 rounded-2xl border bg-card p-6">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">{text}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-6 flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
              <Compass className="size-4 text-primary" aria-hidden />
              Nereden başlayacağınızı bilmiyor musunuz? Keşif görüşmesiyle birlikte karar verelim.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section id="nasil-calisir" className="py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHeading eyebrow="Nasıl çalışır" title="Talepten çalışan akışa üç adım" />
            <ol className="mt-12 grid gap-6 md:grid-cols-3">
              {steps.map((step, i) => (
                <li key={step.title} className="relative rounded-2xl border p-6">
                  <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Lead form */}
        <section id="talep" className="border-y bg-muted/40 py-16 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.4fr] lg:gap-14">
            <div>
              <p className="text-sm font-semibold tracking-wide text-primary uppercase">Talep formu</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                Hangi iş sizi yoruyor? Anlatın, birlikte bakalım.
              </h2>
              <p className="mt-4 text-muted-foreground">
                Formu doldurduğunuzda talebiniz kaydedilir ve keşif görüşmesi için size dönüş
                yapılır (senaryo gereği). Satış baskısı yok; görüşme sonunda yol haritanızı
                yazılı olarak paylaşırız.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {[
                  "Ortalama dönüş süresi: 1 iş günü",
                  "Keşif görüşmesi ücretsiz ve 30 dakika",
                  "Bilgileriniz yalnızca bu demo sunucusunda saklanır",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5">
                    <CircleCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-8">
              <LeadForm />
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="sss" className="py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <SectionHeading eyebrow="SSS" title="Sık sorulan sorular" />
            <Accordion className="mt-10 rounded-2xl border px-5">
              {faqs.map((f) => (
                <AccordionItem key={f.q} value={f.q}>
                  <AccordionTrigger className="py-4 text-base">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="flex items-center gap-2">
            <Workflow className="size-4 text-primary" aria-hidden />
            Akışly — kurgusal bir hizmettir.
          </p>
          <p>Bu site bir demo projesidir; ticari amaçla kullanılmaz. Yalnızca test verisi girin.</p>
        </div>
      </footer>
    </>
  );
}
