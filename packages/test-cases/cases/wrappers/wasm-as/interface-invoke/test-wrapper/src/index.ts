import {
  Interface,
  Interface_Module,
  Args_moduleMethod,
  ImplementationType,
  IModule
} from "./wrap";

export class Module extends IModule {
  moduleMethod(args: Args_moduleMethod): ImplementationType {
    const uris = Interface.getImplementations();
    const result = new Interface_Module(uris[0]).abstractModuleMethod({
      arg: {
        str: args.arg.str
      }
    }).unwrap();
    return {
      str: result,
      uint8: args.arg.uint8,
    };
  }
}