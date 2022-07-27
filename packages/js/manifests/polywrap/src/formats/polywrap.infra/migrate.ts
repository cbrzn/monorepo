/* eslint-disable */
/**
 * This file was automatically generated by scripts/manifest/migrate-ts.mustache.
 * DO NOT MODIFY IT BY HAND. Instead, modify scripts/manifest/migrate-ts.mustache,
 * and run node ./scripts/manifest/generateFormatTypes.js to regenerate this file.
 */
import {
  AnyInfraManifest,
  InfraManifest,
  InfraManifestFormats,
  latestInfraManifestFormat
} from ".";


type Migrator = {
  [key in InfraManifestFormats]?: (m: AnyInfraManifest) => InfraManifest;
};

export const migrators: Migrator = {
};

export function migrateInfraManifest(
  manifest: AnyInfraManifest,
  to: InfraManifestFormats
): InfraManifest {
  let from = manifest.format as InfraManifestFormats;

  // HACK: Patch fix for backwards compatability
  if(from === "0.1.0" && ("0.1" in migrators)) {
    from = "0.1" as InfraManifestFormats;
  }

  if (from === latestInfraManifestFormat) {
    return manifest as InfraManifest;
  }

  if (!(Object.values(InfraManifestFormats).some(x => x === from))) {
    throw new Error(`Unrecognized InfraManifestFormat "${manifest.format}"`);
  }

  throw new Error(`This should never happen, InfraManifest migrators is empty. from: ${from}, to: ${to}`);
}
