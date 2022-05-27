const express = require("express");
const sharp = require("sharp");
const crypto = require("crypto");
const fs = require("fs");

const postProcessImages = require("../utils/utils").postProcessImages;
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

module.exports = router;
