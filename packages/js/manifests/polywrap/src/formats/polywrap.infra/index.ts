/* eslint-disable */
/**
 * This file was automatically generated by scripts/manifest/index-ts.mustache.
 * DO NOT MODIFY IT BY HAND. Instead, modify scripts/manifest/index-ts.mustache,
 * and run node ./scripts/manifest/generateFormatTypes.js to regenerate this file.
 */

import {
  InfraManifest as InfraManifest0_1
} from "./0.1";

export {
  InfraManifest0_1,
};

export enum InfraManifestFormats {
  "v0.1" = "0.1",
}

export type AnyInfraManifest =
  | InfraManifest0_1

export type InfraManifest = InfraManifest0_1;

export const latestInfraManifestFormat = InfraManifestFormats["v0.1"]

export { migrateInfraManifest } from "./migrate";

export { deserializeInfraManifest } from "./deserialize";

export { validateInfraManifest } from "./validate";
