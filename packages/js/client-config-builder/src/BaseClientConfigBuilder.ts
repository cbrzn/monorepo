import { ClientConfig } from "./ClientConfig";
import { IClientConfigBuilder } from "./IClientConfigBuilder";
import { ClientConfigBuilder } from "./ClientConfigBuilder";

import {
  CoreClientConfig,
  Uri,
  IUriPackage,
  IUriWrapper,
  Env,
  IUriRedirect,
} from "@polywrap/core-js";
import { UriResolverLike } from "@polywrap/uri-resolvers-js";

export abstract class BaseClientConfigBuilder implements IClientConfigBuilder {
  protected config: ClientConfig<Uri> = {
    envs: [],
    interfaces: [],
    redirects: [],
    wrappers: [],
    packages: [],
    resolvers: [],
  };

  abstract addDefaults(): ClientConfigBuilder;
  abstract buildCoreConfig(): CoreClientConfig<Uri>;

  add(config: Partial<ClientConfig>): ClientConfigBuilder {
    if (config.envs) {
      this.addEnvs(config.envs);
    }

    if (config.interfaces) {
      for (const interfaceImpl of config.interfaces) {
        this.addInterfaceImplementations(
          interfaceImpl.interface,
          interfaceImpl.implementations
        );
      }
    }

    if (config.redirects) {
      this.addRedirects(config.redirects);
    }

    if (config.wrappers) {
      this.addWrappers(config.wrappers);
    }

    if (config.packages) {
      this.addPackages(config.packages);
    }

    if (config.resolvers) {
      this.addResolvers(config.resolvers);
    }

    return this;
  }

  addWrapper(uriWrapper: IUriWrapper<Uri | string>): ClientConfigBuilder {
    const wrapperUri = Uri.from(uriWrapper.uri);

    const existingRegistration = this.config.wrappers.find((x) =>
      Uri.equals(x.uri, wrapperUri)
    );

    if (existingRegistration) {
      existingRegistration.wrapper = uriWrapper.wrapper;
    } else {
      this.config.wrappers.push({
        uri: wrapperUri,
        wrapper: uriWrapper.wrapper,
      });
    }

    return this;
  }

  addWrappers(uriWrappers: IUriWrapper<Uri | string>[]): ClientConfigBuilder {
    for (const uriWrapper of uriWrappers) {
      this.addWrapper(uriWrapper);
    }

    return this;
  }

  removeWrapper(uri: Uri | string): ClientConfigBuilder {
    const wrapperUri = Uri.from(uri);

    const idx = this.config.wrappers.findIndex((x) =>
      Uri.equals(x.uri, wrapperUri)
    );

    if (idx > -1) {
      this.config.wrappers.splice(idx, 1);
    }

    return this;
  }

  addPackage(uriPackage: IUriPackage<Uri | string>): ClientConfigBuilder {
    const packageUri = Uri.from(uriPackage.uri);

    const existingRegistration = this.config.packages.find((x) =>
      Uri.equals(x.uri, packageUri)
    );

    if (existingRegistration) {
      existingRegistration.package = uriPackage.package;
    } else {
      this.config.packages.push({
        uri: packageUri,
        package: uriPackage.package,
      });
    }

    return this;
  }

  addPackages(uriPackages: IUriPackage<Uri | string>[]): ClientConfigBuilder {
    for (const uriPackage of uriPackages) {
      this.addPackage(uriPackage);
    }

    return this;
  }

  removePackage(uri: Uri | string): ClientConfigBuilder {
    const packageUri = Uri.from(uri);

    const idx = this.config.packages.findIndex((x) =>
      Uri.equals(x.uri, packageUri)
    );

    if (idx > -1) {
      this.config.packages.splice(idx, 1);
    }

    return this;
  }

  addEnv(uri: Uri | string, env: Record<string, unknown>): ClientConfigBuilder {
    const envUri = Uri.from(uri);

    const idx = this.config.envs.findIndex((x) => Uri.equals(x.uri, envUri));

    if (idx > -1) {
      this.config.envs[idx].env = {
        ...this.config.envs[idx].env,
        ...env,
      };
    } else {
      this.config.envs.push({
        uri: envUri,
        env: env,
      });
    }

    return this;
  }

  addEnvs(envs: Env<Uri | string>[]): ClientConfigBuilder {
    for (const env of envs) {
      this.addEnv(env.uri, env.env);
    }

    return this;
  }

  removeEnv(uri: Uri | string): ClientConfigBuilder {
    const envUri = Uri.from(uri);

    const idx = this.config.envs.findIndex((x) => Uri.equals(x.uri, envUri));

    if (idx > -1) {
      this.config.envs.splice(idx, 1);
    }

    return this;
  }

  setEnv(uri: Uri | string, env: Record<string, unknown>): ClientConfigBuilder {
    const envUri = Uri.from(uri);

    const idx = this.config.envs.findIndex((x) => Uri.equals(x.uri, envUri));

    if (idx > -1) {
      this.config.envs[idx].env = env;
    } else {
      this.config.envs.push({
        uri: envUri,
        env: env,
      });
    }

    return this;
  }

  addInterfaceImplementation(
    interfaceUri: Uri | string,
    implementationUri: Uri | string
  ): ClientConfigBuilder {
    const interfaceUriSanitized = Uri.from(interfaceUri);
    const implementationUriSanitized = Uri.from(implementationUri);

    const existingInterface = this.config.interfaces.find((x) =>
      Uri.equals(x.interface, interfaceUriSanitized)
    );

    if (existingInterface) {
      if (
        !existingInterface.implementations.some((x) =>
          Uri.equals(x, implementationUriSanitized)
        )
      ) {
        existingInterface.implementations.push(implementationUriSanitized);
      }
    } else {
      this.config.interfaces.push({
        interface: interfaceUriSanitized,
        implementations: [implementationUriSanitized],
      });
    }

    return this;
  }

  addInterfaceImplementations(
    interfaceUri: Uri | string,
    implementationUris: Array<Uri | string>
  ): ClientConfigBuilder {
    const interfaceUriSanitized = Uri.from(interfaceUri);
    const implementationUrisSanitized = implementationUris.map(Uri.from);

    const existingInterface = this.config.interfaces.find((x) =>
      Uri.equals(x.interface, interfaceUriSanitized)
    );

    if (existingInterface) {
      for (const implUri of implementationUrisSanitized) {
        if (
          !existingInterface.implementations.some((x) => Uri.equals(x, implUri))
        ) {
          existingInterface.implementations.push(implUri);
        }
      }
    } else {
      this.config.interfaces.push({
        interface: interfaceUriSanitized,
        implementations: implementationUrisSanitized,
      });
    }

    return this;
  }

  removeInterfaceImplementation(
    interfaceUri: Uri | string,
    implementationUri: Uri | string
  ): ClientConfigBuilder {
    const interfaceUriSanitized = Uri.from(interfaceUri);
    const implementationUriSanitized = Uri.from(implementationUri);

    const existingInterface = this.config.interfaces.find((x) =>
      Uri.equals(x.interface, interfaceUriSanitized)
    );

    if (existingInterface) {
      const idx = existingInterface.implementations.findIndex((x) =>
        Uri.equals(x, implementationUriSanitized)
      );

      if (idx > -1) {
        existingInterface.implementations.splice(idx, 1);
      }

      if (existingInterface.implementations.length === 0) {
        this.config.interfaces.splice(
          this.config.interfaces.indexOf(existingInterface),
          1
        );
      }
    }

    return this;
  }

  addRedirect(from: Uri | string, to: Uri | string): ClientConfigBuilder {
    const fromSanitized = Uri.from(from);
    const toSanitized = Uri.from(to);

    const existingRedirect = this.config.redirects.find((x) =>
      Uri.equals(x.from, fromSanitized)
    );

    if (existingRedirect) {
      existingRedirect.to = toSanitized;
    } else {
      this.config.redirects.push({
        from: fromSanitized,
        to: toSanitized,
      });
    }

    return this;
  }

  addRedirects(redirects: IUriRedirect<Uri | string>[]): ClientConfigBuilder {
    for (const redirect of redirects) {
      this.addRedirect(redirect.from, redirect.to);
    }

    return this;
  }

  removeRedirect(from: Uri | string): ClientConfigBuilder {
    const fromSanitized = Uri.from(from);

    const idx = this.config.redirects.findIndex((x) =>
      Uri.equals(x.from, fromSanitized)
    );

    if (idx > -1) {
      this.config.redirects.splice(idx, 1);
    }

    return this;
  }

  addResolver(resolver: UriResolverLike): ClientConfigBuilder {
    this.config.resolvers.push(resolver);

    return this;
  }

  addResolvers(resolvers: UriResolverLike[]): ClientConfigBuilder {
    for (const resolver of resolvers) {
      this.addResolver(resolver);
    }

    return this;
  }

  build(): ClientConfig<Uri> {
    return this.config;
  }
}