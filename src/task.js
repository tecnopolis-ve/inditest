const express = require("express");
const sharp = require("sharp");
const crypto = require("crypto");
const fs = require("fs");
const getFilenameAndExtension =
    require("../utils/utils").getFilenameAndExtension;
const getImageInfo = require("../utils/utils").getImageInfo;

const router = express.Router();
const Task = require("../models").Task;
const Image = require("../models").Image;

const checkFile = (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send("No image was uploaded");
    }

    if (!req.files[0].mimetype.match(/^image/)) {
        return res.status(400).send("Not a valid image");
    }

    next();
};

const resize = async (image, width) => {
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
                path: toFile,
                resolution: `${imageInfo.width}x${imageInfo.height}`,
                md5,
            });
        });
    } catch (error) {
        console.log("error", error);
        throw Error(error);
    }
};

const getTasks = async (req, res) => {
    const tasks = await Task.findAll();

    res.send(tasks);
};

const getTask = async (req, res) => {
    const id = req.params.id;

    const task = await Task.findOne({
        where: {
            id,
        },
    });

    if (task) {
        return res.send(task);
    }

    res.status(404).send("Image not found");
};

const postProcessImages = async (task) => {
    const resolutions = [800, 1024];
    let newTasks = [];

    for (const j in resolutions) {
        newTasks.push(resize(task, resolutions[j]));
    }

    return Promise.all([newTasks]);
};

const postTask = async (req, res) => {
    let uploadedFile;
    let uploadPath = "./input/";

    try {
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
        }

        uploadedFile = req.files[0];
        uploadPath = uploadPath + uploadedFile.originalname;

        const saveFile = fs.createWriteStream(uploadPath);

        saveFile.write(uploadedFile.buffer);
        saveFile.end();
        saveFile.on("finish", async function () {
            const imageInfo = await getImageInfo(uploadedFile.buffer);
            const md5 = crypto
                .createHash("md5")
                .update(uploadedFile.buffer)
                .digest("hex");

            const task = await Task.create({
                path: uploadPath,
                status: "RAW",
                process: false,
            });
            await Image.create({
                path: uploadPath,
                resolution: `${imageInfo.width}x${imageInfo.height}`,
                md5,
            });
            await postProcessImages(task);
            res.send(`Image uploaded!`);
        });
    } catch (error) {
        console.log("error", error);
        res.status(500).send(`Something went wrong!`);
    }
};

router.get("/", getTasks);
router.get("/:id", getTask);
router.post("/", checkFile, postTask);
router.post("/process", postProcessImages);

module.exports = router;
