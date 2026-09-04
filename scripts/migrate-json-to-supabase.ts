import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const DATA_DIR = path.join(process.cwd(), 'data');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error(
    'Missing Supabase env vars. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) to your local .env.local or Vercel env.'
  );
}

const supabase = createClient(url, key, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

const tableMappings = [
  { file: 'gyms.json', table: 'gyms' },
  { file: 'users.json', table: 'users' },
  { file: 'members.json', table: 'members' },
  { file: 'membership-plans.json', table: 'membershipPlans' },
  { file: 'payments.json', table: 'payments' },
  { file: 'notifications.json', table: 'notifications' },
] as const;

function readJsonFile<T>(fileName: string): T[] {
  const filePath = path.join(DATA_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T[];
}

async function clearTable(tableName: string) {
  const { error } = await supabase.from(tableName).delete().neq('id', '');
  if (error) {
    throw new Error(`Failed to clear ${tableName}: ${error.message}`);
  }
}

async function upsertTable(tableName: string, records: Record<string, unknown>[]) {
  if (!records.length) {
    console.log(`Skipping ${tableName}: no rows found.`);
    return;
  }

  const { error } = await supabase.from(tableName).upsert(records, {
    onConflict: 'id',
    ignoreDuplicates: false,
  });

  if (error) {
    throw new Error(`Failed to insert into ${tableName}: ${error.message}`);
  }

  console.log(`Inserted ${records.length} rows into ${tableName}`);
}

async function main() {
  for (const mapping of tableMappings) {
    const rows = readJsonFile<Record<string, unknown>>(mapping.file);
    console.log(`Found ${rows.length} rows in ${mapping.file}`);

    // Clear existing table first so the JSON source is the source of truth.
    await clearTable(mapping.table);
    await upsertTable(mapping.table, rows);
  }

  console.log('Migration completed successfully.');
}

main().catch((error: unknown) => {
  console.error('Migration failed:');
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }
  process.exit(1);
});
