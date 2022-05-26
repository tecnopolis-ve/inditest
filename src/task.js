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

const getTasks = async (req, res) => {
    const tasks = await Task.findAll();

    res.send(tasks);
};

const getTask = async (req, res) => {
    res.send("getTask");
};

const postProcessImages = async (req, res) => {
    const tasks = await Task.findAll({
        where: { processed: false },
    });

    for (const i in tasks){
        console.log(tasks[i]);
    }

    res.send("postProcessImages");
};

const postTask = async (req, res) => {
    res.send("postTask");
};

router.get("/", getTasks);
router.get("/:id", getTask);
router.post("/", checkFile, postTask);
router.post("/process", postProcessImages);

module.exports = router;
