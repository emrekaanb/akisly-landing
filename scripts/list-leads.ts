import { closeDb, countLeads, listLeads, resolveDbPath } from "../src/lib/db";
import { serviceLabel } from "../src/lib/lead-schema";

const limit = Number(process.argv[2]) || 20;
const leads = listLeads(limit);

console.log(`Veritabanı: ${resolveDbPath()}`);
console.log(`Toplam kayıt: ${countLeads()} (son ${leads.length} gösteriliyor)\n`);

if (leads.length === 0) {
  console.log("Henüz kayıt yok.");
} else {
  console.table(
    leads.map((l) => ({
      id: l.id,
      createdAt: l.createdAt,
      name: l.name,
      email: l.email,
      service: serviceLabel(l.service),
      description: l.description.length > 60 ? `${l.description.slice(0, 57)}...` : l.description,
    })),
  );
}

closeDb();
