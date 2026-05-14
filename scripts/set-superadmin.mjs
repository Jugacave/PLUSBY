// Corre con: node scripts/set-superadmin.mjs
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ryffforwvcieuelhziza.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5ZmZmb3J3dmNpZXVlbGh6aXphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTc1NTY3MiwiZXhwIjoyMDkxMzMxNjcyfQ.R2M9cFFVxaZCf02AWwvA_g1YetD_Hd3jO6VYPd_wnlk";
const TARGET_EMAIL = "jcarranza715@gmail.com";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// 1. Buscar el usuario por email
const { data: users, error: listError } = await supabase.auth.admin.listUsers();
if (listError) { console.error("Error listando usuarios:", listError.message); process.exit(1); }

const user = users.users.find((u) => u.email === TARGET_EMAIL);
if (!user) {
  console.error(`No se encontró ningún usuario con el correo ${TARGET_EMAIL}.`);
  console.error("Asegúrate de que ese correo esté registrado en Plusby primero.");
  process.exit(1);
}

console.log(`Usuario encontrado: ${user.email} (id: ${user.id})`);
console.log(`Metadata actual:`, user.user_metadata);

// 2. Actualizar metadata con role: superadmin
const { data: updated, error: updateError } = await supabase.auth.admin.updateUserById(
  user.id,
  { user_metadata: { ...user.user_metadata, role: "superadmin" } }
);

if (updateError) { console.error("Error actualizando usuario:", updateError.message); process.exit(1); }

console.log("\n✓ ¡Listo! Rol superadmin asignado correctamente.");
console.log(`Email: ${updated.user.email}`);
console.log(`Metadata nueva:`, updated.user.user_metadata);
