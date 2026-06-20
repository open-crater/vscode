import * as https from "https";
import * as http from "http";
import { URL } from "url";
import { apiOrigin } from "./config";

/** Shape of `GET /v1/dev/me` (device-token authenticated). */
export interface DevMe {
  userId: string;
  displayName: string;
  trustTier: string;
  status: string;
  balanceMicroUsd: number;
  pendingMicroUsd: number;
}

/** Minimal typed GET → parsed JSON, or null on any non-2xx / network / parse error. */
function getJson(urlStr: string, headers: Record<string, string>): Promise<unknown | null> {
  return new Promise((resolve) => {
    let u: URL;
    try {
      u = new URL(urlStr);
    } catch {
      return resolve(null);
    }
    const lib = u.protocol === "http:" ? http : https;
    const req = lib.request(u, { method: "GET", headers }, (res) => {
      const code = res.statusCode ?? 0;
      if (code < 200 || code >= 300) {
        res.resume();
        return resolve(null);
      }
      let data = "";
      res.setEncoding("utf8");
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(null);
        }
      });
    });
    req.on("error", () => resolve(null));
    req.setTimeout(10_000, () => req.destroy());
    req.end();
  });
}

export class OpenCraterApi {
  /** Verify a device token and fetch the wallet summary. null = invalid/unreachable. */
  async devMe(token: string): Promise<DevMe | null> {
    const j = (await getJson(`${apiOrigin()}/v1/dev/me`, {
      authorization: `Bearer ${token}`,
    })) as Partial<DevMe> | null;
    if (!j || typeof j.balanceMicroUsd !== "number") return null;
    return j as DevMe;
  }
}
