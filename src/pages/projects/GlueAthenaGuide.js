import { useState } from "react";

const steps = [
  {
    id: "s3",
    title: "Step 1: Your Messy S3 Bucket",
    subtitle: "The Starting Point — Mixed Files, Mixed Schemas",
    visual: () => (
      <div className="flex flex-col items-center gap-3">
        <div className="bg-orange-900 border-2 border-orange-500 rounded-xl p-4 w-full max-w-lg">
          <div className="text-orange-300 font-bold text-center mb-3">s3://my-data-lake/</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { name: "sales/", files: ["jan_sales.csv", "feb_sales.csv"], color: "emerald", schema: "date, product, amount, region" },
              { name: "users/", files: ["users_2024.csv", "users_2025.csv"], color: "blue", schema: "user_id, name, email, signup_date" },
              { name: "events/", files: ["clicks.json", "signups.json"], color: "purple", schema: '{"event_type", "timestamp", "payload"}' },
              { name: "logs/", files: ["app_log.json", "err_log.json"], color: "red", schema: '{"level", "message", "service", "ts"}' },
            ].map((folder) => (
              <div key={folder.name} className={`bg-gray-900 rounded-lg p-2 border border-${folder.color}-700`}>
                <div className={`text-${folder.color}-400 font-mono text-sm font-bold`}>{folder.name}</div>
                {folder.files.map((f) => (
                  <div key={f} className="text-gray-400 text-xs font-mono ml-2">📄 {f}</div>
                ))}
                <div className={`text-xs text-${folder.color}-600 mt-1 italic`}>Schema: {folder.schema}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 w-full max-w-lg text-sm">
          <div className="text-yellow-400 font-bold mb-1">Key Point:</div>
          <div className="text-gray-300">Each subfolder has <span className="text-white font-bold">different file formats</span> and <span className="text-white font-bold">different schemas</span>. 
          CSVs have columns, JSONs have keys. Schemas don't match across folders. This is the real-world mess Glue Crawler is designed to handle.</div>
        </div>
      </div>
    ),
    explanation: [
      "Your S3 bucket is just a storage dump — it has NO idea what's inside the files.",
      "Files can be CSV, JSON, Parquet, ORC, Avro — all mixed together.",
      "Each subfolder can have completely different schemas (columns/fields).",
      "S3 alone cannot be queried with SQL — it's just object storage.",
      "This is where Glue Crawler enters the picture..."
    ]
  },
  {
    id: "crawler",
    title: "Step 2: Glue Crawler Scans Everything",
    subtitle: "The Detective — Discovers Schemas Automatically",
    visual: () => (
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-full max-w-lg">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-purple-900 border-2 border-purple-400 rounded-xl p-3 text-center">
              <div className="text-purple-300 font-bold">🔍 Glue Crawler</div>
              <div className="text-purple-400 text-xs">Scanning S3...</div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {[
              { path: "s3://my-data-lake/sales/", format: "CSV", action: "Reads headers → date, product, amount, region", schema: "Infers types: string, string, double, string", color: "emerald" },
              { path: "s3://my-data-lake/users/", format: "CSV", action: "Reads headers → user_id, name, email, signup_date", schema: "Infers types: bigint, string, string, date", color: "blue" },
              { path: "s3://my-data-lake/events/", format: "JSON", action: "Samples JSON keys → event_type, timestamp, payload", schema: "Infers types: string, timestamp, struct<...>", color: "purple" },
              { path: "s3://my-data-lake/logs/", format: "JSON", action: "Samples JSON keys → level, message, service, ts", schema: "Infers types: string, string, string, timestamp", color: "red" },
            ].map((item, i) => (
              <div key={i} className={`bg-gray-900 border border-${item.color}-700 rounded-lg p-2 flex gap-3 items-start`}>
                <div className={`bg-${item.color}-900 text-${item.color}-300 px-2 py-1 rounded text-xs font-bold whitespace-nowrap`}>{item.format}</div>
                <div className="flex-1">
                  <div className="text-gray-400 font-mono text-xs">{item.path}</div>
                  <div className="text-gray-300 text-xs mt-1">→ {item.action}</div>
                  <div className="text-gray-500 text-xs">→ {item.schema}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 w-full max-w-lg text-sm">
          <div className="text-yellow-400 font-bold mb-1">What Crawler Actually Does:</div>
          <div className="text-gray-300 space-y-1">
            <div>1. Walks through each S3 prefix (subfolder)</div>
            <div>2. <span className="text-white font-bold">Samples files</span> — reads a few to detect format (CSV? JSON? Parquet?)</div>
            <div>3. <span className="text-white font-bold">Extracts schema</span> — column names from CSV headers, keys from JSON</div>
            <div>4. <span className="text-white font-bold">Infers data types</span> — looks at values to guess string, int, date, etc.</div>
            <div>5. <span className="text-white font-bold">Groups compatible files</span> — files with same schema → same table</div>
          </div>
        </div>
      </div>
    ),
    explanation: [
      "Crawler uses CLASSIFIERS to detect file format (built-in: CSV, JSON, Parquet, etc.)",
      "For CSV: reads the first row as headers, samples data rows to infer column types.",
      "For JSON: samples documents, extracts all unique keys, infers nested structures.",
      "CRITICAL: Files in the SAME prefix with the SAME schema get grouped into ONE table.",
      "If two CSVs in the same folder have DIFFERENT schemas, crawler creates SEPARATE tables!",
      "You can configure crawler to treat each S3 prefix as a separate table (most common)."
    ]
  },
  {
    id: "catalog",
    title: "Step 3: Glue Data Catalog — The Result",
    subtitle: "A Virtual Database of Metadata (Not Data!)",
    visual: () => (
      <div className="flex flex-col items-center gap-3">
        <div className="bg-indigo-950 border-2 border-indigo-400 rounded-xl p-4 w-full max-w-lg">
          <div className="text-indigo-300 font-bold text-center text-lg mb-3">📚 Glue Data Catalog</div>
          <div className="text-indigo-400 text-center text-xs mb-3">Database: "my_data_lake_db"</div>
          <div className="space-y-2">
            {[
              { table: "sales", location: "s3://my-data-lake/sales/", format: "CSV", cols: ["date (string)", "product (string)", "amount (double)", "region (string)"], color: "emerald", rows: "~10,000 rows" },
              { table: "users", location: "s3://my-data-lake/users/", format: "CSV", cols: ["user_id (bigint)", "name (string)", "email (string)", "signup_date (date)"], color: "blue", rows: "~5,000 rows" },
              { table: "events", location: "s3://my-data-lake/events/", format: "JSON", cols: ["event_type (string)", "timestamp (timestamp)", "payload (struct)"], color: "purple", rows: "~1M rows" },
              { table: "logs", location: "s3://my-data-lake/logs/", format: "JSON", cols: ["level (string)", "message (string)", "service (string)", "ts (timestamp)"], color: "red", rows: "~500K rows" },
            ].map((t) => (
              <div key={t.table} className={`bg-gray-900 rounded-lg p-2 border border-${t.color}-800`}>
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-${t.color}-400 font-bold font-mono`}>📋 {t.table}</span>
                  <span className="text-gray-600 text-xs">{t.format} | {t.rows}</span>
                </div>
                <div className="text-gray-500 text-xs font-mono mb-1">→ {t.location}</div>
                <div className="flex flex-wrap gap-1">
                  {t.cols.map((c) => (
                    <span key={c} className="bg-gray-800 text-gray-400 text-xs px-1.5 py-0.5 rounded font-mono">{c}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 w-full max-w-lg text-sm">
          <div className="text-yellow-400 font-bold mb-1">Critical Understanding:</div>
          <div className="text-gray-300">The Glue Catalog stores <span className="text-white font-bold">ZERO actual data</span>. It's pure metadata:
            table names, column names, data types, file formats, and <span className="text-white font-bold">S3 locations</span>.
            Think of it as a <span className="text-cyan-400 font-bold">phone book</span> — it tells you WHERE to find data and WHAT SHAPE it is, but doesn't hold the data itself.</div>
        </div>
      </div>
    ),
    explanation: [
      "Each S3 prefix typically becomes ONE TABLE in the catalog.",
      "The catalog is organized: Account → Database(s) → Table(s) → Columns.",
      "Each table stores: column names, data types, file format, S3 location, partition info.",
      "If crawler finds 2 CSVs with different schemas in ONE folder, it can create 2 tables (or merge with union).",
      "You can have MULTIPLE databases to organize tables logically.",
      "The catalog is basically a HIVE-COMPATIBLE metastore — this is why Athena can use it!"
    ]
  },
  {
    id: "schema-conflict",
    title: "Step 4: What Happens With Schema Conflicts?",
    subtitle: "The Confusing Part — Different CSVs, Different Columns",
    visual: () => (
      <div className="flex flex-col items-center gap-3">
        <div className="w-full max-w-lg space-y-3">
          <div className="text-center text-gray-400 font-bold mb-2">Scenario: Two CSVs in same folder with different schemas</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-900 border border-yellow-700 rounded-lg p-2">
              <div className="text-yellow-400 font-mono text-sm font-bold">orders_v1.csv</div>
              <div className="text-gray-400 text-xs mt-1 font-mono">id, product, price</div>
              <div className="text-gray-600 text-xs font-mono">1, Widget, 9.99</div>
              <div className="text-gray-600 text-xs font-mono">2, Gadget, 19.99</div>
            </div>
            <div className="bg-gray-900 border border-orange-700 rounded-lg p-2">
              <div className="text-orange-400 font-mono text-sm font-bold">orders_v2.csv</div>
              <div className="text-gray-400 text-xs mt-1 font-mono">id, product, price, discount, tax</div>
              <div className="text-gray-600 text-xs font-mono">3, Thingamajig, 29.99, 5.00, 2.50</div>
            </div>
          </div>
          <div className="text-center text-2xl">⬇️</div>
          <div className="bg-indigo-950 border border-indigo-500 rounded-lg p-3">
            <div className="text-indigo-300 font-bold text-center mb-2">Crawler Behavior (configurable):</div>
            <div className="space-y-2">
              <div className="bg-gray-900 rounded p-2 border border-green-800">
                <div className="text-green-400 text-sm font-bold">Option A: "Create a single table" (default)</div>
                <div className="text-gray-400 text-xs">Merges schemas → id, product, price, discount, tax</div>
                <div className="text-gray-500 text-xs">v1 rows will have NULL for discount & tax columns</div>
              </div>
              <div className="bg-gray-900 rounded p-2 border border-amber-800">
                <div className="text-amber-400 text-sm font-bold">Option B: "Create separate tables"</div>
                <div className="text-gray-400 text-xs">orders_v1 → table with 3 columns</div>
                <div className="text-gray-400 text-xs">orders_v2 → table with 5 columns</div>
              </div>
              <div className="bg-gray-900 rounded p-2 border border-red-800">
                <div className="text-red-400 text-sm font-bold">Option C: Schemas too different → crawler fails/skips</div>
                <div className="text-gray-400 text-xs">If column types conflict (same name, different type), crawler may error</div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 w-full max-w-lg text-sm">
          <div className="text-yellow-400 font-bold mb-1">Best Practice:</div>
          <div className="text-gray-300">Keep files with the <span className="text-white font-bold">same schema in the same prefix</span>. Use separate prefixes for different schemas. Configure crawler's <span className="text-cyan-400 font-bold">grouping behavior</span> in crawler settings (table level = S3 prefix).</div>
        </div>
      </div>
    ),
    explanation: [
      "Crawler grouping behavior is set when you create the crawler.",
      "'One table per S3 prefix' is the safest — each folder = one table.",
      "If schemas overlap (superset), crawler does a UNION merge → extra columns get NULLs.",
      "If schemas CONFLICT (same column name, different type), the crawler picks the broader type or fails.",
      "You can set 'schema change policy': UPDATE (overwrite), LOG, ADD_NEW_COLUMNS.",
      "Re-running crawler on changed data respects this policy for evolving schemas."
    ]
  },
  {
    id: "athena",
    title: "Step 5: Athena — SQL on S3 via Glue Catalog",
    subtitle: "Why Athena NEEDS Glue Catalog",
    visual: () => (
      <div className="flex flex-col items-center gap-3">
        <div className="w-full max-w-lg">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="bg-blue-950 border-2 border-blue-400 rounded-xl p-3 text-center w-64">
              <div className="text-blue-300 font-bold text-lg">🔎 Athena</div>
              <div className="text-blue-400 text-xs">Serverless SQL Engine (Presto/Trino)</div>
            </div>
          </div>
          <div className="bg-gray-900 rounded-xl p-3 border border-gray-700 mb-3">
            <div className="text-gray-400 text-xs mb-1">Your SQL Query:</div>
            <div className="font-mono text-sm text-green-400">
              SELECT region, SUM(amount) as total<br/>
              FROM my_data_lake_db.sales<br/>
              WHERE date {'>'} '2025-01-01'<br/>
              GROUP BY region
            </div>
          </div>
          <div className="text-center text-lg mb-2">⬇️ What happens under the hood ⬇️</div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 bg-gray-900 rounded-lg p-2 border border-indigo-800">
              <span className="bg-indigo-800 text-indigo-200 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</span>
              <span className="text-gray-300 text-sm">Athena asks <span className="text-indigo-400 font-bold">Glue Catalog</span>: "Where is the <code className="text-cyan-400">sales</code> table? What's its schema? What format?"</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-900 rounded-lg p-2 border border-indigo-800">
              <span className="bg-indigo-800 text-indigo-200 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</span>
              <span className="text-gray-300 text-sm">Catalog responds: "It's CSV at <code className="text-orange-400">s3://my-data-lake/sales/</code>, columns: date, product, amount, region"</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-900 rounded-lg p-2 border border-green-800">
              <span className="bg-green-800 text-green-200 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</span>
              <span className="text-gray-300 text-sm">Athena <span className="text-green-400 font-bold">reads S3 files directly</span> using schema from catalog, applies WHERE filter, runs aggregation</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-900 rounded-lg p-2 border border-yellow-800">
              <span className="bg-yellow-800 text-yellow-200 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">4</span>
              <span className="text-gray-300 text-sm">Results returned + saved to <code className="text-yellow-400">s3://athena-results/</code> as CSV</span>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 w-full max-w-lg text-sm">
          <div className="text-yellow-400 font-bold mb-1">Why Athena NEEDS Glue:</div>
          <div className="text-gray-300">S3 is just bytes in buckets. Athena needs to know: <span className="text-white font-bold">where</span> are the files, <span className="text-white font-bold">what format</span> are they, <span className="text-white font-bold">what columns</span> exist, and <span className="text-white font-bold">what types</span> are they. 
          Glue Catalog provides all of this. Without it, Athena has no idea how to interpret the raw bytes in S3. 
          Think of Athena as a <span className="text-cyan-400 font-bold">SQL engine with no storage</span> — Glue is its schema dictionary, S3 is its disk.</div>
        </div>
      </div>
    ),
    explanation: [
      "Athena is based on Presto/Trino — an open-source distributed SQL engine.",
      "It's SERVERLESS: no infrastructure to manage, you pay per TB scanned.",
      "Athena does NOT copy or move your data — it reads S3 in place (schema-on-read).",
      "Glue Catalog is Athena's ONLY way to understand S3 data structure.",
      "You can also manually create tables in Athena using CREATE EXTERNAL TABLE DDL (bypassing crawler).",
      "Query results are written to an S3 output bucket as CSV — this is important for QuickSight!"
    ]
  },
  {
    id: "quicksight",
    title: "Step 6: QuickSight — Dashboards from Athena",
    subtitle: "Connecting Athena to Visual Dashboards",
    visual: () => (
      <div className="flex flex-col items-center gap-3">
        <div className="w-full max-w-lg">
          <div className="flex items-center justify-between gap-1 mb-4 flex-wrap">
            {["S3", "Glue Crawler", "Glue Catalog", "Athena", "QuickSight"].map((s, i) => (
              <div key={s} className="flex items-center gap-1">
                <div className={`px-2 py-1 rounded text-xs font-bold ${i === 4 ? "bg-pink-900 text-pink-300 border border-pink-500" : "bg-gray-800 text-gray-400 border border-gray-700"}`}>{s}</div>
                {i < 4 && <span className="text-gray-600">→</span>}
              </div>
            ))}
          </div>
          <div className="bg-pink-950 border-2 border-pink-400 rounded-xl p-3 mb-3">
            <div className="text-pink-300 font-bold text-center text-lg mb-2">📊 QuickSight Connection</div>
            <div className="space-y-2">
              <div className="bg-gray-900 rounded-lg p-2 border border-gray-700">
                <div className="text-cyan-400 text-sm font-bold">Method 1: Direct Athena Query (most common)</div>
                <div className="text-gray-400 text-xs mt-1">QuickSight → New Dataset → Athena → Select Database → Select Table → Build Visual</div>
                <div className="text-gray-500 text-xs">Runs live queries via Athena. Slower but always fresh.</div>
              </div>
              <div className="bg-gray-900 rounded-lg p-2 border border-gray-700">
                <div className="text-green-400 text-sm font-bold">Method 2: SPICE Import (recommended)</div>
                <div className="text-gray-400 text-xs mt-1">QuickSight → New Dataset → Athena → Import to SPICE (in-memory cache)</div>
                <div className="text-gray-500 text-xs">Loads data into SPICE engine. Super fast dashboards. Schedule refresh.</div>
              </div>
              <div className="bg-gray-900 rounded-lg p-2 border border-gray-700">
                <div className="text-yellow-400 text-sm font-bold">Method 3: Custom SQL</div>
                <div className="text-gray-400 text-xs mt-1">QuickSight → Athena → "Use custom SQL" → Write complex JOIN/aggregation</div>
                <div className="text-gray-500 text-xs">Best for pre-aggregated dashboards combining multiple tables.</div>
              </div>
            </div>
          </div>
          <div className="bg-gray-900 rounded-xl p-3 border border-pink-800">
            <div className="text-pink-300 font-bold mb-2">Dashboard Example:</div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gray-800 rounded p-2 text-center">
                <div className="text-2xl font-bold text-emerald-400">$1.2M</div>
                <div className="text-gray-500 text-xs">Total Sales</div>
              </div>
              <div className="bg-gray-800 rounded p-2 text-center">
                <div className="text-2xl font-bold text-blue-400">5,231</div>
                <div className="text-gray-500 text-xs">Active Users</div>
              </div>
              <div className="bg-gray-800 rounded p-2 text-center">
                <div className="text-2xl font-bold text-purple-400">1.2M</div>
                <div className="text-gray-500 text-xs">Events</div>
              </div>
            </div>
            <div className="mt-2 text-gray-500 text-xs text-center">↑ All sourced from S3 via Athena, visualized in QuickSight</div>
          </div>
        </div>
      </div>
    ),
    explanation: [
      "QuickSight connects to Athena as a DATA SOURCE — it sends SQL queries to Athena.",
      "Athena runs the query (using Glue Catalog for schema) → returns results → QuickSight visualizes.",
      "SPICE is QuickSight's in-memory engine: pre-loads data for fast dashboard rendering.",
      "SPICE refresh can be scheduled (hourly, daily) to keep dashboards updated.",
      "QuickSight can also join data from MULTIPLE Athena tables in a single dataset.",
      "You can publish dashboards to other users, embed in apps, or export to PDF."
    ]
  },
  {
    id: "fullpipeline",
    title: "Full Pipeline — Putting It All Together",
    subtitle: "The Complete Data Flow from Upload to Dashboard",
    visual: () => (
      <div className="flex flex-col items-center gap-3">
        <div className="w-full max-w-lg space-y-2">
          {[
            { icon: "📁", label: "S3 Bucket", desc: "Raw CSV/JSON files land here", color: "orange", role: "STORAGE" },
            { icon: "🔍", label: "Glue Crawler", desc: "Scans S3 → detects format & schema per prefix", color: "purple", role: "DISCOVERY" },
            { icon: "📚", label: "Glue Data Catalog", desc: "Stores metadata: table definitions, column types, S3 paths", color: "indigo", role: "METADATA" },
            { icon: "🔎", label: "Athena", desc: "SQL engine reads S3 using Catalog schemas (schema-on-read)", color: "blue", role: "QUERY" },
            { icon: "📊", label: "QuickSight", desc: "Visualizes Athena query results as dashboards", color: "pink", role: "VISUALIZE" },
          ].map((item, i) => (
            <div key={i}>
              <div className={`bg-gray-900 border border-${item.color}-700 rounded-lg p-3 flex items-center gap-3`}>
                <div className="text-3xl">{item.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-${item.color}-400 font-bold`}>{item.label}</span>
                    <span className={`bg-${item.color}-900 text-${item.color}-300 text-xs px-1.5 py-0.5 rounded`}>{item.role}</span>
                  </div>
                  <div className="text-gray-400 text-sm">{item.desc}</div>
                </div>
              </div>
              {i < 4 && <div className="text-center text-gray-600 text-lg">↓</div>}
            </div>
          ))}
        </div>
        <div className="bg-gray-800 rounded-lg p-3 w-full max-w-lg text-sm">
          <div className="text-yellow-400 font-bold mb-1">The Key Insight:</div>
          <div className="text-gray-300">
            Data <span className="text-white font-bold">never leaves S3</span>. Glue Catalog is just a metadata index. Athena reads S3 in place. 
            This is <span className="text-cyan-400 font-bold">schema-on-read</span> — unlike a traditional DB where you define schema before loading data, here you discover schema from existing data. 
            That's what makes this serverless data lake approach so powerful and flexible.
          </div>
        </div>
      </div>
    ),
    explanation: [
      "This is a SERVERLESS data lake stack — no servers to manage anywhere.",
      "Cost model: S3 storage + Athena per-TB scanned + QuickSight per-user.",
      "Pro tip: Convert CSV/JSON to PARQUET using Glue ETL jobs → Athena scans 90% less data.",
      "Pro tip: PARTITION your S3 data (e.g., /year=2025/month=01/) → Athena skips irrelevant partitions.",
      "The entire pipeline can be automated: S3 event → Lambda → Start Crawler → Crawler done → Athena view auto-refreshes → SPICE refresh.",
      "This is the standard AWS analytics pattern used by most data teams."
    ]
  }
];

export default function GlueAthenaGuide() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const step = steps[currentStep];

  return (
    <div className="bg-gray-950 min-h-screen text-white p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-orange-400 via-blue-400 to-pink-400 bg-clip-text text-transparent">
            S3 → Glue → Athena → QuickSight
          </h1>
          <p className="text-gray-500 text-sm">Interactive Pipeline Guide</p>
        </div>

        <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
          {steps.map((s, i) => (
            <button
              key={s.id}
              onClick={() => { setCurrentStep(i); setShowDetails(false); }}
              className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap transition-all ${
                i === currentStep
                  ? "bg-blue-600 text-white"
                  : i < currentStep
                  ? "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  : "bg-gray-900 text-gray-600 hover:bg-gray-800"
              }`}
            >
              {i + 1}. {s.id === "fullpipeline" ? "Full Flow" : s.id === "schema-conflict" ? "Conflicts" : s.id.charAt(0).toUpperCase() + s.id.slice(1)}
            </button>
          ))}
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-bold text-white">{step.title}</h2>
          <p className="text-gray-400 text-sm">{step.subtitle}</p>
        </div>

        <div className="mb-4">{step.visual()}</div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm text-gray-400 hover:text-white hover:border-gray-500 transition-all mb-3"
        >
          {showDetails ? "▼ Hide" : "▶ Show"} Deep Dive Details
        </button>

        {showDetails && (
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 mb-4 space-y-2">
            {step.explanation.map((e, i) => (
              <div key={i} className="flex gap-2 text-sm">
                <span className="text-blue-500 font-bold mt-0.5">•</span>
                <span className="text-gray-300">{e}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between">
          <button
            onClick={() => { setCurrentStep(Math.max(0, currentStep - 1)); setShowDetails(false); }}
            disabled={currentStep === 0}
            className="px-4 py-2 bg-gray-800 rounded-lg text-sm font-medium disabled:opacity-30 hover:bg-gray-700 transition-all"
          >
            ← Previous
          </button>
          <span className="text-gray-600 text-sm self-center">{currentStep + 1} / {steps.length}</span>
          <button
            onClick={() => { setCurrentStep(Math.min(steps.length - 1, currentStep + 1)); setShowDetails(false); }}
            disabled={currentStep === steps.length - 1}
            className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium disabled:opacity-30 hover:bg-blue-500 transition-all"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}