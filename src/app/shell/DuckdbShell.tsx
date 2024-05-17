import * as React from "react";

import "xterm/css/xterm.css";

import * as duckdb from "@duckdb/duckdb-wasm";
import duckdb_wasm from "@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm";
import duckdb_wasm_eh from "@duckdb/duckdb-wasm/dist/duckdb-eh.wasm";


import shell_wasm from '@duckdb/duckdb-wasm-shell/dist/shell_bg.wasm';

export const DUCKDB_BUNDLES: duckdb.DuckDBBundles = {
  mvp: {
    mainModule: duckdb_wasm,
    mainWorker:
      // Only want this code to execute client side
      global.window &&
      new URL(
        "@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js",
        import.meta.url
      ).toString(),
  },
  eh: {
    mainModule: duckdb_wasm_eh,
    mainWorker:
      // Only want this code to execute client side
      global.window &&
      new URL(
        "@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js",
        import.meta.url
      ).toString(),
  },
};

type SomeComponentProps = Record<string, string>;


const Shell: React.FC<SomeComponentProps> = (props: SomeComponentProps) => {

    const term = React.useRef<HTMLDivElement | null>(null);
    React.useEffect(() => {
      // Need to delay importing of shell since it can only run client side (not in node)
      // Next.js renders server-side in node
      const shell = require("@duckdb/duckdb-wasm-shell");

        shell.embed({
            shellModule: shell_wasm,
            container: term.current!,
            resolveDatabase: async () => {
                const bundle = await duckdb.selectBundle(DUCKDB_BUNDLES);
                const logger = new duckdb.ConsoleLogger();
                const worker = new Worker(bundle.mainWorker!);
                const db = new duckdb.AsyncDuckDB(logger, worker);
                await db.instantiate(bundle.mainModule);
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