import { prisma } from "@/db";

async function main() {
    // await prisma.application.create({
    //     data: {
    //         name: "Application",
    //         slug: uuid(),
    //         domain: "www.google.se",
    //         type: "DOCKER_COMPOSE",
    //         meta: JSON.stringify({
    //             composeFileContent:
    //                 "version: '3'\n\nservices:\n  web:\n    image: 'nginx:alpine'\n    ports:\n      - 80:80",
    //         }),
    //         reverseProxies: {
    //             create: {
    //                 port: 3000,
    //                 description: "Main application",
    //             },
    //         },
    //     },
    // });
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
