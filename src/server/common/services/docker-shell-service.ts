import { ShellService } from "./shell-service";

type DockerShellProps = {
    path: string;
};

const startCompose = async ({ path }: DockerShellProps) =>
    ShellService.exec(`docker compose up -d`, { path, sudo: true });

const stopCompose = async ({ path }: DockerShellProps) =>
    ShellService.exec(`docker compose down --remove-orphans`, { path, sudo: true });

export const DockerShellService = { startCompose, stopCompose };
