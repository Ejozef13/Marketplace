// Runs only against the Docker database created by this repository's local config.
import { readdirSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const directory = new URL("../supabase/tests/", import.meta.url);
const files = readdirSync(directory).filter((name) => name.endsWith(".sql")).sort();
if (files.length === 0) throw new Error("No database tests found.");
for (const file of files) {
  const result = spawnSync("docker", [
    "exec", "-i", "supabase_db_patriot-marketplace",
    // The local superuser can assume Auth's role as well as application roles.
    // Individual assertions explicitly SET ROLE, so RLS is exercised as users.
    "psql", "-X", "--set", "ON_ERROR_STOP=1", "--username", "supabase_admin", "--dbname", "postgres",
  ], { cwd: root, input: readFileSync(new URL(file, directory)), encoding: "utf8" });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    process.stderr.write(result.stdout ?? "");
    process.stderr.write(result.stderr ?? "");
    process.exit(result.status ?? 1);
  }
  console.log(`PASS ${file} (transaction rolled back)`);
}
console.log(`${files.length} SQL test files passed.`);
