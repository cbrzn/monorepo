import { ProjectWithSchema } from "../";

export abstract class ImportedProject<TManifest> extends ProjectWithSchema<TManifest> {

  /// Abstract Interface

  public abstract getNamespace(): string;

}