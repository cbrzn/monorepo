import { runCommand } from "./command";

interface CopyArgs {
  tempDir: string;
  imageName: string;
  source: string;
  destination: string;
}

interface BuildArgs {
  tempDir: string;
  outputImageName: string;
  args: string;
}

export function transformEnvToArgs(
  env: Record<string, string | string[]>
): string {
  return Object.entries(env)
    .map(([key, value]) => {
      if (typeof value === "string") {
        return `--build-arg ${key}=${value}`;
      } else if (Array.isArray(value)) {
        return `--build-arg ${key}="${value.join(" ")}"`;
      } else {
        throw new Error(
          "Unsupported env variable type. Supported types: string, string[]"
        );
      }
    })
    .join(" ");
}

export async function copyFromImageToHost(
  { tempDir, imageName, source, destination }: CopyArgs,
  quiet = true
): Promise<void> {
  await runCommand(
    `cd ${tempDir} && docker create -ti --name temp ${imageName}`,
    quiet
  );
  await runCommand(
    `cd ${tempDir} && docker cp temp:/app/${source}/. ${destination}`,
    quiet
  );
  await runCommand(`cd ${tempDir} && docker rm -f temp`, quiet);
}

export async function copyFromHostToImage(
  { tempDir, imageName, source, destination }: CopyArgs,
  quiet = true
): Promise<void> {
  await runCommand(
    `cd ${tempDir} && docker create -ti --name temp ${imageName}`,
    quiet
  );
  console.log(tempDir, " ", source, " ", ` temp:/app/${destination}`);
  await runCommand(
    `cd ${tempDir} && docker cp ${source} temp:/app/${destination}`,
    quiet
  );
  await runCommand(`cd ${tempDir} && docker rm -f temp`, quiet);
}

export async function buildImage(
  { tempDir, outputImageName, args }: BuildArgs,
  quiet = true
): Promise<void> {
  await runCommand(
    `cd ${tempDir} && docker build -t ${outputImageName} . ${args}`,
    quiet
  );
}
