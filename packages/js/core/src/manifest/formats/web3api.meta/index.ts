/* eslint-disable */
/**
 * This file was automatically generated by scripts/manifest/index-ts.mustache.
 * DO NOT MODIFY IT BY HAND. Instead, modify scripts/manifest/index-ts.mustache,
 * and run node ./scripts/manifest/generateFormatTypes.js to regenerate this file.
 */

import {
  MetaManifest as MetaManifest0_0_1_prealpha_1
} from "./0.0.1-prealpha.1";

export {
  MetaManifest0_0_1_prealpha_1,
};

export enum MetaManifestFormats {
  "0.0.1-prealpha.1" = "0.0.1-prealpha.1",
}

export type AnyMetaManifest =
  | MetaManifest0_0_1_prealpha_1

export type MetaManifest = MetaManifest0_0_1_prealpha_1;

export const latestMetaManifestFormat = MetaManifestFormats["0.0.1-prealpha.1"]

export { migrateMetaManifest } from "./migrate";

export { deserializeMetaManifest } from "./deserialize";

export { validateMetaManifest } from "./validate";