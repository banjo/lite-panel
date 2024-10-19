import { ShellService } from "./shell-service";

type DockerShellProps = {
    path: string;
};

const startCompose = async ({ path }: DockerShellProps) =>
    ShellService.exec(`docker compose up -d`, { path });

const stopCompose = async ({ path }: DockerShellProps) =>
    ShellService.exec(`docker compose down --remove-orphans`, { path });

export const DockerShellService = { startCompose, stopCompose };
