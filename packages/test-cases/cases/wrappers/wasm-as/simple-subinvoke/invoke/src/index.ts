import { Args_addAndIncrement, Add_Module, IModule } from "./wrap";
import { Args_add as ImportedArgs_add } from "./wrap/imported/Add_Module/serialization";

export class Module extends IModule {
  addAndIncrement(args: Args_addAndIncrement): i32 {
    let importedArgs: ImportedArgs_add = {
      a: args.a,
      b: args.b
    }
    return Add_Module.add(importedArgs).unwrap() + 1
  }
}