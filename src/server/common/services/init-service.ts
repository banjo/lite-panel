import { createLogger } from "@/utils/logger";
import { CaddyService } from "./caddy-service";

const logger = createLogger("init-service");

const initServer = async () => {
    logger.info("Initializing server");

    // TODO: check for mismatch between database and folders
    await CaddyService.addActiveConfigsToDefault();
    logger.debug("INIT: Added active configs to default Caddyfile");

    logger.info("Server initialized");
};

export const InitService = { initServer };
