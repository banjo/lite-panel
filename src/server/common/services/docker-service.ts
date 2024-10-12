import { ShellService } from "./shell-service";

type DockerShellProps = {
    path: string;
};

const start = async ({ path }: DockerShellProps) =>
    ShellService.exec(`docker compose up -d`, { path });

const stop = async ({ path }: DockerShellProps) =>
    ShellService.exec(`docker compose down --remove-orphans`, { path });

export const DockerService = { start, stop };
