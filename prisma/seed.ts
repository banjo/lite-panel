import { prisma } from "@/db";

async function main() {
    await prisma.application.create({
        data: {
            name: "Application",
            slug: "application",
            port: 3000,
            domain: "www.google.se",
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
