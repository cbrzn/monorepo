import { query } from "./resolvers";
import { manifest, HTTP_Query } from "./w3";
import { RequestData, RequestError } from "./types";

import {
  Client,
  Plugin,
  PluginFactory,
  PluginPackageManifest,
  PluginModules,
} from "@web3api/core-js";

export interface GraphNodeConfig {
  provider: string;
}

export class GraphNodePlugin extends Plugin {
  constructor(private _config: GraphNodeConfig) {
    super();
  }

  public static manifest(): PluginPackageManifest {
    return manifest;
  }

  // TODO: generated types here from the schema.graphql to ensure safety `Resolvers<TQuery, TMutation>`
  // https://github.com/web3-api/monorepo/issues/101
  public getModules(client: Client): PluginModules {
    return {
      query: query(this, client),
    };
  }

  public async query(
    author: string,
    name: string,
    query: string,
    client: Client
  ): Promise<string> {
    const { data, error } = await HTTP_Query.post(
      {
        url: `${this._config.provider}/subgraphs/name/${author}/${name}`,
        request: {
          body: JSON.stringify({
            query,
          }),
          responseType: "TEXT",
        }
      },
      client,
    );

    if (error) {
      throw new Error(`GraphNodePlugin: errors encountered. Error: ${error}`);
    }

    if (!data) {
      throw new Error(`GraphNodePlugin: data is undefined.`);
    }

    if (!data.body) {
      throw Error(`GraphNodePlugin: body is undefined.`);
    }

    const responseJson = (data.body as unknown) as
      | RequestError
      | RequestData;

    const responseErrors = (responseJson as RequestError).errors;

    if (responseErrors) {
      throw new Error(`GraphNodePlugin: errors in query string. Errors:
        ${responseErrors
          .map((err) =>
            err.locations
              ? `\n -Locations: ${err.locations
                  .map((loc) => `(col: ${loc.column}, line: ${loc.line})`)
                  .join(", ")} \n-Message: ${err.message}`
              : `\n-Message: ${err.message}`
          )
          .join("\n")}
      `);
    }

    return JSON.stringify(responseJson);
  }
}

export const graphNodePlugin: PluginFactory<GraphNodeConfig> = (
  opts: GraphNodeConfig
) => {
  return {
    factory: () => new GraphNodePlugin(opts),
    manifest: manifest,
  };
};
export const plugin = graphNodePlugin;
