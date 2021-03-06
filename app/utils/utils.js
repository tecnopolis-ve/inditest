const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const Task = require("../models").Task;
const Image = require("../models").Image;

const getFilenameAndExtension = (pathfilename) => {
    return [path.parse(pathfilename).name, path.parse(pathfilename).ext];
};

const getImageInfo = async (image) => {
    const readImg = sharp(image);
    return await readImg.metadata();
};

const persistResizedImage = async (image, imageInfo) => {
    await Task.update(
        { processed: true },
        {
            where: {
                id: image.id,
                processed: false,
            },
        }
    );
    await Image.create({
        path: imageInfo.toFile,
        resolution: `${imageInfo.width}x${imageInfo.height}`,
        md5: imageInfo.md5,
    });
};

const resizeImage = async (image, width) => {
    const fileProperties = getFilenameAndExtension(image.path);
    const outputPath = `./output/${fileProperties[0]}/${width}`;

    try {
        if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath, { recursive: true });
        }

        const rawImage = await sharp(image.path)
            .resize({
                width,
            })
            .toBuffer();

        const md5 = crypto.createHash("md5").update(rawImage).digest("hex");
        const toFile = `${outputPath}/${md5}${fileProperties[1]}`;

        const saveFile = fs.createWriteStream(toFile);
        saveFile.write(rawImage);
        saveFile.end();
        saveFile.on("finish", async function () {
            const imageInfo = await getImageInfo(rawImage);
            await persistResizedImage(image, { toFile, md5, ...imageInfo });
        });
    } catch (error) {
        console.log("error", error);
        throw new Error(error);
    }
};

const postProcessImages = async (task) => {
    const resolutions = [800, 1024];
    let newTasks = [];

    for (const j in resolutions) {
        newTasks.push(resizeImage(task, resolutions[j]));
    }

    return Promise.all([newTasks]);
};

module.exports = {
    getFilenameAndExtension,
    getImageInfo,
    resizeImage,
    postProcessImages,
};
