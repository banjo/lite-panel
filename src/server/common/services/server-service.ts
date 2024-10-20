import { createLogger } from "@/utils/logger";
import { AsyncResultType, Result } from "@banjoanton/utils";
import { publicIpv4 } from "public-ip";
import si from "systeminformation";

const logger = createLogger("server-service");

type SystemInformation = {
    cpuCores: number;
    totalMemGB: string;
    diskSizeGB: string;
    os: string;
    ipAddress?: string;
};

const getInfo = async (): AsyncResultType<SystemInformation> => {
    try {
        const ipAddress = await publicIpv4();

        const cpu = await si.cpu();
        const cpuCores = cpu.cores;

        const mem = await si.mem();
        const totalMemGB = (mem.total / 1024 ** 3).toFixed(0);

        const disk = await si.diskLayout();
        const primaryDisk = disk.length > 0 ? disk[0] : { name: "Unknown", size: 0 };
        const diskSizeGB = (primaryDisk.size / 1024 ** 3).toFixed(0);

        const osInfo = await si.osInfo();
        const os = osInfo.distro;

        const systemInfo: SystemInformation = {
            cpuCores,
            totalMemGB,
            diskSizeGB,
            os,
            ipAddress,
        };

        return Result.ok(systemInfo);
    } catch (error) {
        logger.error({ error }, "Failed to get system information");
        return Result.error("Failed to get system information");
    }
};

export const ServerService = { getInfo };
