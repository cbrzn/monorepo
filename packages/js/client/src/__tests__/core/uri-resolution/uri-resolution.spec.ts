import { Uri } from "../../../../";
import { buildWrapper } from "@polywrap/test-env-js";
import { GetPathToTestWrappers } from "@polywrap/test-cases";
import {
  coreInterfaceUris,
  IUriResolutionStep,
  PluginModule,
  UriPackageOrWrapper,
  UriResolutionContext,
  UriResolutionResult,
} from "@polywrap/core-js";
import { buildCleanUriHistory, getUriResolutionPath } from "@polywrap/uri-resolvers-js";
import { getClient } from "../../utils/getClient";
import fs from "fs";
import { WrapManifest } from "@polywrap/wrap-manifest-types-js";
import { Result } from "@polywrap/result";

jest.setTimeout(200000);

const wrapperPath = `${GetPathToTestWrappers()}/wasm-as/simple`;
const wrapperUri = new Uri(`wrap://file/${wrapperPath}/build`);

const simpleFsResolverWrapperPath = `${GetPathToTestWrappers()}/wasm-as/simple-fs-resolver`;
const simpleFsResolverWrapperUri = new Uri(
  `wrap://file/${simpleFsResolverWrapperPath}/build`
);

const simpleRedirectResolverWrapperPath = `${GetPathToTestWrappers()}/wasm-as/simple-redirect-resolver`;
const simpleRedirectResolverWrapperUri = new Uri(
  `wrap://file/${simpleRedirectResolverWrapperPath}/build`
);

const expectResultWithHistory = async (
  receivedResult: Result<UriPackageOrWrapper, unknown>,
  expectedResult: Result<UriPackageOrWrapper, unknown>,
  uriHistory: IUriResolutionStep<unknown>[],
  historyFileName: string
): Promise<void> => {
  if (historyFileName && uriHistory) {
    await expectHistory(uriHistory, historyFileName);
  }
  
  expect(receivedResult).toEqual(expectedResult);
};

const expectHistory = async (
  receivedHistory: IUriResolutionStep<unknown>[] | undefined,
  historyFileName: string
): Promise<void> => {
  if (!receivedHistory) {
    fail("History is not defined");
  }

  let expectedCleanHistory = await fs.promises.readFile(
    `${__dirname}/histories/${historyFileName}.json`,
    "utf-8"
  );

  const receivedCleanHistory = replaceAll(
    JSON.stringify(buildCleanUriHistory(receivedHistory), null, 2),
    `${GetPathToTestWrappers()}/wasm-as`,
    "$root-wrapper-dir"
  );

  expect(receivedCleanHistory).toEqual(
    JSON.stringify(JSON.parse(expectedCleanHistory), null, 2)
  );
};

const expectPackageWithHistory = async (
  receivedResult: Result<UriPackageOrWrapper, unknown>,
  expectedUri: Uri,
  uriHistory: IUriResolutionStep<unknown>[],
  historyFileName: string
): Promise<void> => {
  if (historyFileName && uriHistory) {
    await expectHistory(uriHistory, historyFileName);
  }

  if (!receivedResult.ok) {
    fail("Uri resolution failed " + receivedResult.error);
  }

  const uriPackageOrWrapper = receivedResult.value;

  if (uriPackageOrWrapper.type !== "package") {
    if (uriPackageOrWrapper.type === "wrapper") {
      fail(
        `Uri resolution did not return a package, it returned a wrapper (${uriPackageOrWrapper.wrapper.uri.uri})`
      );
    } else {
      fail(
        `Uri resolution did not return a package, it returned a uri (${uriPackageOrWrapper.uri.uri})`
      );
    }
  }

  expect(uriPackageOrWrapper.package.uri).toEqual(expectedUri);
};

const expectWrapperWithHistory = async (
  receivedResult: Result<UriPackageOrWrapper, unknown>,
  expectedUri: Uri,
  uriHistory: IUriResolutionStep<unknown>[],
  historyFileName: string
): Promise<void> => {
  if (historyFileName && uriHistory) {
    await expectHistory(uriHistory, historyFileName);
  }

  if (!receivedResult.ok) {
    fail("Uri resolution failed " + receivedResult.error);
  }

  const uriPackageOrWrapper = receivedResult.value;

  if (uriPackageOrWrapper.type !== "wrapper") {
    if (uriPackageOrWrapper.type === "package") {
      fail(
        `Uri resolution did not return a wrapper, it returned a package (${uriPackageOrWrapper.package.uri.uri})`
      );
    } else {
      fail(
        `Uri resolution did not return a wrapper, it returned a uri (${uriPackageOrWrapper.uri.uri})`
      );
    }
  }

  expect(uriPackageOrWrapper.wrapper.uri).toEqual(expectedUri);
};

function replaceAll(str: string, strToReplace: string, replaceStr: string) {
  return str.replace(new RegExp(strToReplace, "g"), replaceStr);
}

describe("URI resolution", () => {
  beforeAll(async () => {
    await buildWrapper(wrapperPath);
    await buildWrapper(simpleFsResolverWrapperPath);
    await buildWrapper(simpleRedirectResolverWrapperPath);
  });

  it("sanity", async () => {
    const uri = new Uri("ens/uri.eth");

    const client = await getClient();

    const resolutionContext = new UriResolutionContext();
    const result = await client.tryResolveUri({ uri, resolutionContext });

    await expectResultWithHistory(
      result,
      UriResolutionResult.ok(uri),
      resolutionContext.getHistory(),
      "sanity"
    );
  });

  it("can resolve redirects", async () => {
    const fromUri = new Uri("ens/from.eth");
    const toUri1 = new Uri("ens/to1.eth");
    const toUri2 = new Uri("ens/to2.eth");

    const client = await getClient({
      redirects: [
        {
          from: fromUri.uri,
          to: toUri1.uri,
        },
        {
          from: toUri1.uri,
          to: toUri2.uri,
        },
      ],
    });

    const resolutionContext = new UriResolutionContext();
    const response = await client.tryResolveUri({ uri: fromUri, resolutionContext });

    await expectResultWithHistory(
      response,
      UriResolutionResult.ok(toUri2),
      getUriResolutionPath(resolutionContext.getHistory()),
      "can resolve redirects"
    );
  });

  it("can resolve plugin", async () => {
    const pluginUri = new Uri("ens/plugin.eth");

    const client = await getClient({
      plugins: [
        {
          uri: pluginUri.uri,
          plugin: {
            factory: () => {
              return ({} as unknown) as PluginModule<{}>;
            },
            manifest: { } as WrapManifest,
          },
        },
      ],
    });

    const resolutionContext = new UriResolutionContext();
    const result = await client.tryResolveUri({ uri: pluginUri, resolutionContext });

    await expectWrapperWithHistory(
      result, 
      pluginUri, 
      getUriResolutionPath(resolutionContext.getHistory()), 
      "can resolve plugin"
    );
  });

  it("can resolve a URI resolver extension wrapper", async () => {
    const client = await getClient({
      interfaces: [
        {
          interface: coreInterfaceUris.uriResolver.uri,
          implementations: [simpleFsResolverWrapperUri.uri],
        },
      ],
    });

    const sourceUri = new Uri(`simple/${wrapperPath}/build`);
    const redirectedUri = wrapperUri;

    const resolutionContext = new UriResolutionContext();
    const response = await client.tryResolveUri({ uri: sourceUri, resolutionContext });

    await expectWrapperWithHistory(
      response,
      redirectedUri,
      getUriResolutionPath(resolutionContext.getHistory()),
      "can resolve a URI resolver extension wrapper"
    );
  });

  it("can resolve cache", async () => {
    const client = await getClient();

    const resolutionContext1 = new UriResolutionContext();
    const result1 = await client.tryResolveUri({ uri: wrapperUri, resolutionContext: resolutionContext1 });

    console.log(result1);
    await expectWrapperWithHistory(
      result1,
      wrapperUri,
      getUriResolutionPath(resolutionContext1.getHistory()),
      "can resolve cache - 1"
    );

    const resolutionContext2 = new UriResolutionContext();
    const result2 = await client.tryResolveUri({ uri: wrapperUri, resolutionContext: resolutionContext2 });

    await expectWrapperWithHistory(
      result2,
      wrapperUri,
      getUriResolutionPath(resolutionContext2.getHistory()),
      "can resolve cache - 2"
    );
  });

  it("can resolve previously cached URI after redirecting by a URI resolver extension", async () => {
    const client = await getClient({
      interfaces: [
        {
          interface: coreInterfaceUris.uriResolver.uri,
          implementations: [
            simpleFsResolverWrapperUri.uri,
            simpleRedirectResolverWrapperUri.uri,
          ],
        },
      ],
    });

    const sourceUri = new Uri(`simple-redirect/${wrapperPath}/build`);
    const redirectedUri = new Uri(`simple/${wrapperPath}/build`);
    const finalUri = wrapperUri;

    const resolutionContext1 = new UriResolutionContext();
    const result1 = await client.tryResolveUri({ uri: redirectedUri, resolutionContext: resolutionContext1 });

    await expectWrapperWithHistory(
      result1,
      finalUri,
      getUriResolutionPath(resolutionContext1.getHistory()),
      "can resolve previously cached URI after redirecting by a URI resolver extension - 1"
    );

    const resolutionContext2 = new UriResolutionContext();
    const result2 = await client.tryResolveUri({ uri: sourceUri, resolutionContext: resolutionContext2 });

    await expectWrapperWithHistory(
      result2,
      finalUri,
      getUriResolutionPath(resolutionContext2.getHistory()),
      "can resolve previously cached URI after redirecting by a URI resolver extension - 2"
    );
  });

  it("restarts URI resolution after URI resolver extension redirect", async () => {
    // Testing that the URI resolution process restarts after a URI resolver extension redirect
    const sourceUri = new Uri(`simple-redirect/${wrapperPath}/build`);
    const resolverRedirectUri = new Uri(`simple/${wrapperPath}/build`);
    const finalRedirectedUri = new Uri(`ens/redirect.eth`);
    const client = await getClient({
      redirects: [
        {
          from: resolverRedirectUri.uri,
          to: finalRedirectedUri.uri,
        },
      ],
      interfaces: [
        {
          interface: coreInterfaceUris.uriResolver.uri,
          implementations: [
            simpleFsResolverWrapperUri.uri,
            simpleRedirectResolverWrapperUri.uri,
          ],
        },
      ],
    });
  
    const resolutionContext1 = new UriResolutionContext();
    const result = await client.tryResolveUri({ uri: sourceUri, resolutionContext: resolutionContext1 });
    await expectResultWithHistory(
      result,
      UriResolutionResult.ok(finalRedirectedUri),
      getUriResolutionPath(resolutionContext1.getHistory()),
      "restarts URI resolution after URI resolver extension redirect"
    );
  });

  it("can resolve uri with custom resolver", async () => {
    const ensUri = new Uri(`ens/test`);
    const redirectUri = new Uri(`ens/redirect.eth`);

    const client = await getClient({
      resolver: {
        tryResolveUri: async (uri: Uri) => {
          if (uri.uri === ensUri.uri) {
            return UriResolutionResult.ok(redirectUri);
          }

          return UriResolutionResult.ok(uri);
        },
      },
    });

    const result = await client.tryResolveUri({ uri: ensUri });

    expect(result).toEqual(UriResolutionResult.ok(redirectUri));
  });

  it("can resolve uri with custom resolver at invoke-time", async () => {
    const fromUri = new Uri(`ens/from.eth`);
    const redirectUri = new Uri(`ens/to.eth`);

    const client = await getClient();

    const result = await client.tryResolveUri({
      uri: fromUri,
      config: {
        resolver: {
          tryResolveUri: async (uri: Uri) => {
            if (uri.uri === fromUri.uri) {
              return UriResolutionResult.ok(redirectUri);
            }

            return UriResolutionResult.ok(uri);
          },
        },
      },
    });

    expect(result).toEqual(UriResolutionResult.ok(redirectUri));
  });

  it("custom wrapper resolver does not cause infinite recursion when resolved at runtime", async () => {
    const client = await getClient({
      interfaces: [
        {
          interface: coreInterfaceUris.uriResolver.uri,
          implementations: ["ens/undefined-resolver.eth"],
        },
      ],
    });

    const resolutionContext = new UriResolutionContext();
    const result = await client.tryResolveUri({ uri: "ens/test.eth", resolutionContext });

    await expectResultWithHistory(
      result,
      UriResolutionResult.err(
        "While resolving wrap://ens/test.eth with URI resolver extension wrap://ens/undefined-resolver.eth, the extension could not be fully resolved. Last found URI is wrap://ens/undefined-resolver.eth"
      ),
      getUriResolutionPath(resolutionContext.getHistory()),
      "custom wrapper resolver does not cause infinite recursion when resolved at runtime"
    );
  });
});
