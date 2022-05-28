import { Command, Program } from "./types";
import {
  Compiler,
  Web3ApiProject,
  SchemaComposer,
  Watcher,
  WatchEvent,
  watchEventName,
  intlMsg,
  defaultWeb3ApiManifest,
  isDockerInstalled,
  FileLock,
} from "../lib";
import {
  parseWasmManifestFileOption,
  parseBuildOutputDirOption,
} from "../lib/parsers";

import { print } from "gluegun";
import path from "path";
import readline from "readline";

const defaultManifestStr = defaultWeb3ApiManifest.join(" | ");
const pathStr = intlMsg.commands_build_options_o_path();

type BuildCommandOptions = {
  manifestFile: string;
  outputDir: string;
  watch?: boolean;
  verbose?: boolean;
};

export const build: Command = {
  setup: (program: Program) => {
    program
      .command("build")
      .alias("b")
      .description(intlMsg.commands_build_description())
      .option(
        `-m, --manifest-file <${pathStr}>`,
        intlMsg.commands_build_options_m({
          default: defaultManifestStr,
        })
      )
      .option(
        `-o, --output-dir <${pathStr}>`,
        `${intlMsg.commands_build_options_o()}`
      )
      .option(`-w, --watch`, `${intlMsg.commands_build_options_w()}`)
      .option(`-v, --verbose`, `${intlMsg.commands_build_options_v()}`)
      .action(async (options) => {
        await run({
          ...options,
          manifestFile: parseWasmManifestFileOption(
            options.manifestFile,
            undefined
          ),
          outputDir: parseBuildOutputDirOption(options.outputDir, undefined),
        });
      });
  },
};

async function run(options: BuildCommandOptions) {
  const { watch, verbose, manifestFile, outputDir } = options;

  // Ensure docker is installed
  if (!isDockerInstalled()) {
    console.log(intlMsg.lib_docker_noInstall());
    return;
  }

  const project = new Web3ApiProject({
    rootCacheDir: path.dirname(manifestFile),
    web3apiManifestPath: manifestFile,
    quiet: !verbose,
  });
  await project.validate();

  const dockerLock = new FileLock(
    project.getCachePath("build/DOCKER_LOCK"),
    print.error
  );

  const schemaComposer = new SchemaComposer({
    project,
  });

  const compiler = new Compiler({
    project,
    outputDir,
    schemaComposer,
  });

  const execute = async (): Promise<boolean> => {
    compiler.reset();
    const result = await compiler.compile();

    if (!result) {
      return result;
    }

    return true;
  };

  if (!watch) {
    await dockerLock.request();
    const result = await execute();
    await dockerLock.release();

    if (!result) {
      process.exitCode = 1;
      return;
    }
  } else {
    // Execute
    await dockerLock.request();
    await execute();
    await dockerLock.release();

    const keyPressListener = () => {
      // Watch for escape key presses
      console.log(
        `${intlMsg.commands_build_keypressListener_watching()}: ${project.getManifestDir()}`
      );
      console.log(intlMsg.commands_build_keypressListener_exit());
      readline.emitKeypressEvents(process.stdin);
      process.stdin.on("keypress", async (str, key) => {
        if (
          key.name == "escape" ||
          key.name == "q" ||
          (key.name == "c" && key.ctrl)
        ) {
          await watcher.stop();
          await dockerLock.release();
          process.kill(process.pid, "SIGINT");
        }
      });

      if (process.stdin.setRawMode) {
        process.stdin.setRawMode(true);
      }

      process.stdin.resume();
    };

    keyPressListener();

    // Watch the directory
    const watcher = new Watcher();

    watcher.start(project.getManifestDir(), {
      ignored: [outputDir + "/**", project.getManifestDir() + "/**/w3/**"],
      ignoreInitial: true,
      execute: async (events: WatchEvent[]) => {
        // Log all of the events encountered
        for (const event of events) {
          console.log(`${watchEventName(event.type)}: ${event.path}`);
        }

        // Execute the build
        await dockerLock.request();
        await execute();
        await dockerLock.release();

        // Process key presses
        keyPressListener();
      },
    });
  }

  process.exitCode = 0;
}
