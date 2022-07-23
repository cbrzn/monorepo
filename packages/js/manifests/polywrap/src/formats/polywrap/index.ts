/* eslint-disable */
/**
 * This file was automatically generated by scripts/manifest/index-ts.mustache.
 * DO NOT MODIFY IT BY HAND. Instead, modify scripts/manifest/index-ts.mustache,
 * and run node ./scripts/manifest/generateFormatTypes.js to regenerate this file.
 */

import {
  PolywrapManifest as PolywrapManifest0_1
} from "./0.1";

export {
  PolywrapManifest0_1,
};

export enum PolywrapManifestFormats {
  "v0.1" = "0.1",
}

export type AnyPolywrapManifest =
  | PolywrapManifest0_1

export type PolywrapManifest = PolywrapManifest0_1;

export const latestPolywrapManifestFormat = PolywrapManifestFormats["v0.1"]

export { migratePolywrapManifest } from "./migrate";

export { deserializePolywrapManifest } from "./deserialize";

export { validatePolywrapManifest } from "./validate";
