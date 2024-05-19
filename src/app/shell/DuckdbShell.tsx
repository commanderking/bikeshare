'use client'
import * as React from "react";
import "src/app/globals.css";

import "xterm/css/xterm.css";

import * as duckdb from "@duckdb/duckdb-wasm";

// @ts-ignore - no types available for wasm?
import duckdb_wasm from "@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm";
// @ts-ignore - no types available for wasm?
import duckdb_wasm_eh from "@duckdb/duckdb-wasm/dist/duckdb-eh.wasm";
// @ts-ignore - no types available for wasm?
import shell_wasm from '@duckdb/duckdb-wasm-shell/dist/shell_bg.wasm';


type SomeComponentProps = Record<string, string>;

const bostonParquet = global.window && new URL('boston_recent_year.parquet', window.location.origin).href;
const dcParquet = global.window && new URL('dc_recent_year.parquet', window.location.origin).href;

      // Most of these imports need to happen in useEffect due to server side lodaing from next.js
      const DUCKDB_BUNDLES: duckdb.DuckDBBundles = {
        mvp: {
          mainModule: duckdb_wasm,
          mainWorker:
            global.window && new URL(
              "@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js",
              import.meta.url
            ).toString(),
        },
        eh: {
          mainModule: duckdb_wasm_eh,
          mainWorker:
            global.window && new URL(
              "@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js",
              import.meta.url
            ).toString(),
        },
      };

const Shell: React.FC<SomeComponentProps> = (props: SomeComponentProps) => {

    const term = React.useRef<HTMLDivElement | null>(null);
    React.useEffect(() => {
      const shell = require("@duckdb/duckdb-wasm-shell");


        shell.embed({
            shellModule: shell_wasm,
            container: term.current!,
            resolveDatabase: async () => {
              console.log("resolving")
              console.log({ DUCKDB_BUNDLES });
                const bundle = await duckdb.selectBundle(DUCKDB_BUNDLES);
                const logger = new duckdb.ConsoleLogger();
                const worker = new Worker(bundle.mainWorker!);
                const db = new duckdb.AsyncDuckDB(logger, worker);
                await db.instantiate(bundle.mainModule);
                await db.registerFileURL('boston.parquet', bostonParquet, 4, false);
                await db.registerFileURL('dc.parquet', dcParquet, 4, false);
                return db;
            },
        });
    }, []);
    return  (
        <div>
            <div ref={term} />;
        </div>
    )
};

export default Shell;