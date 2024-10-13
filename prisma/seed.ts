import { prisma } from "@/db";
import { uuid } from "@banjoanton/utils";

async function main() {
    await prisma.application.create({
        data: {
            name: "Application",
            slug: uuid(),
            domain: "www.google.se",
            reverseProxies: {
                create: {
                    port: 3000,
                    description: "Main application",
                },
            },
        },
    });
    console.log("Done with seed!");
}

main()
    .then(async () => {
        await prisma.$disconnect();
        return process.exit(0);
    })
    .catch(async error => {
        console.error(error);
        await prisma.$disconnect();
        process.exit(1);
    });
