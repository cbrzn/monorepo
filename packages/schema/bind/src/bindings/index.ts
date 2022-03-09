import { OutputDirectory, BindLanguage } from "../";
import * as WasmAs from "./wasm-as";
import * as PluginTs from "./plugin-ts";
// import * as AppTs from "./app-ts";

import { TypeInfo } from "@web3api/schema-parse";

export {
  WasmAs,
  PluginTs,
};

export function generateBinding(
  bindLanguage: BindLanguage,
  typeInfo: TypeInfo,
  schema: string
): OutputDirectory {
  switch (bindLanguage) {
    case "wasm-as":
      return WasmAs.generateBinding(typeInfo);
    case "plugin-ts":
      return PluginTs.generateBinding(typeInfo, schema);
    /*case "app-ts":
      return AppTs.generateBinding(typeInfo);*/
    default:
      throw Error(`Error: Language binding unsupported - ${bindLanguage}`);
  }
}
