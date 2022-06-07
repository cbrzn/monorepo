import { Project, ProjectConfig } from ".";
import {
  AppManifestLanguage,
  appManifestLanguages,
  isAppManifestLanguage,
  loadAppManifest,
  appManifestLanguageToBindLanguage,
} from "..";

import { AppManifest, Client } from "@web3api/core-js";
import { ComposerOutput } from "@web3api/schema-compose";
import { bindSchema, BindOutput } from "@web3api/schema-bind";
import { TypeInfo } from "@web3api/schema-parse";
import path from "path";

export interface AppProjectConfig extends ProjectConfig {
  appManifestPath: string;
  client: Client;
}

export class AppProject extends Project<AppManifest> {
  protected _config: AppProjectConfig
  private _appManifest: AppManifest | undefined;

  public static cacheLayout = {
    root: "app",
  };

  constructor(config: Omit<AppProjectConfig, "subDir">) {
    super({
      ...config,
      subDir: AppProject.cacheLayout.root
    });
  }

  /// Project Based Methods

  public reset(): void {
    this._appManifest = undefined;
    this.resetCache();
  }

  public async validate(): Promise<void> {
    const manifest = await this.getManifest();

    // Validate language
    Project.validateManifestLanguage(
      manifest.language,
      appManifestLanguages,
      isAppManifestLanguage
    );
  }

  /// Manifest (web3api.app.yaml)

  public async getName(): Promise<string> {
    return (await this.getManifest()).name;
  }

  public async getManifest(): Promise<AppManifest> {
    if (!this._appManifest) {
      this._appManifest = await loadAppManifest(
        this.getManifestPath(),
        this.quiet
      );
    }

    return Promise.resolve(this._appManifest);
  }

  public getManifestDir(): string {
    return path.dirname(this._config.appManifestPath);
  }

  public getManifestPath(): string {
    return this._config.appManifestPath;
  }

  public async getManifestLanguage(): Promise<AppManifestLanguage> {
    const language = (await this.getManifest()).language;

    Project.validateManifestLanguage(
      language,
      appManifestLanguages,
      isAppManifestLanguage
    );

    return language as AppManifestLanguage;
  }

  /// Schema

  public async getSchemaNamedPaths(): Promise<{
    [name: string]: string;
  }> {
    const manifest = await this.getManifest();
    const dir = this.getManifestDir();
    const namedPaths: { [name: string]: string } = {};

    namedPaths["combined"] = path.join(dir, manifest.schema);
    return namedPaths;
  }

  public async getImportRedirects(): Promise<
    {
      uri: string;
      schema: string;
    }[]
  > {
    const manifest = await this.getManifest();
    return manifest.import_redirects || [];
  }

  public async generateSchemaBindings(
    composerOutput: ComposerOutput,
    generationSubPath?: string
  ): Promise<BindOutput> {
    return bindSchema({
      projectName: await this.getName(),
      modules: [
        {
          name: "combined",
          typeInfo: composerOutput.combined?.typeInfo as TypeInfo,
          schema: composerOutput.combined?.schema as string,
          outputDirAbs: this._getGenerationDirectory(generationSubPath),
        },
      ],
      bindLanguage: appManifestLanguageToBindLanguage(
        await this.getManifestLanguage()
      ),
    });
  }

  private _getGenerationDirectory(generationSubPath = "src/w3"): string {
    return path.join(this.getManifestDir(), generationSubPath);
  }
}
