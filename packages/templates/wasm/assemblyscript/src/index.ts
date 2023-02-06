import { Args_sampleMethod, SampleResult, IModule } from "./wrap";

export class Module extends IModule {
  sampleMethod(args: Args_sampleMethod): SampleResult {
    return {
      result: args.arg,
    };
  }
}
