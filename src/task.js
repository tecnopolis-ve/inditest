const express = require("express");
const path = require("path");
const sharp = require("sharp");
const crypto = require("crypto");
const fs = require("fs");

const router = express.Router();
const Task = require("../models").Task;
const Image = require("../models").Image;

const checkFile = (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send("No se detectó ninguna imagen");
    }

    if (!req.files[0].mimetype.match(/^image/)) {
        return res.status(400).send("No es una imagen válida");
    }

    next();
};

const getFilenameAndExtension = (pathfilename) => {
    return [path.parse(pathfilename).name, path.parse(pathfilename).ext];
};

const resize = async (image, width) => {
    const fileProperties = getFilenameAndExtension(image);
    const outputPath = `./output/${fileProperties[0]}/${width}`;

    try {
        if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath, { recursive: true });
        }

        const rawImage = await sharp(image)
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
            console.log("ok");
        });
    } catch (error) {
        console.log("error", error);
    }
};

const getImageInfo = async (image) => {
    const readImg = sharp(image);
    return await readImg.metadata();
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

    res.status(404).send("Imagen no encontrada");
};

const postProcessImages = async (req, res) => {
    const tasks = await Task.findAll({
        where: { processed: false },
    });

    const resolutions = [800, 1024];
    let newTasks = [];

    for (const i in tasks) {
        for (const j in resolutions) {
            newTasks.push(resize(tasks[i].path, resolutions[j]));
        }
    }

    Promise.all([newTasks]).then((values) => {
        console.log("All done");
    });

    res.send("postProcessImages");
};

const postTask = async (req, res) => {
    let uploadedFile;
    let uploadPath = "./input/";

    try {
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
        }
    } catch (error) {
        console.log("error", error);
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

        await Task.create({ path: uploadPath, status: "RAW", process: false });
        await Image.create({
            path: uploadPath,
            resolution: `${imageInfo.width}x${imageInfo.height}`,
            md5,
        });
        res.send(`Imagen cargada correctamente`);
    });
};

router.get("/", getTasks);
router.get("/:id", getTask);
router.post("/", checkFile, postTask);
router.post("/process", postProcessImages);

module.exports = router;
