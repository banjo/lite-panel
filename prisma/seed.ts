import { prisma } from "@/db";

async function main() {
    await prisma.application.create({
        data: {
            name: "Application",
            slug: "application",
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
