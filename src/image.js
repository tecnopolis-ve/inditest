const express = require("express");
const router = express.Router();

const Image = require("../models").Image;

const getImage = async (req, res) => {
    const id = req.params.id;

    const image = await Image.findOne({
        where: {
            id,
        },
    });

    if (image) {
        return res.download(`${__dirname}/../${image.path}`);
    }

    res.status(404).send("Image not found");
};

const getImages = async (req, res) => {
    const images = await Image.findAll();

    resp = images.map((x) => {
        return {
            path: `/image/${x.id}`,
            resolution: x.resolution,
            md5: x.md5,
        };
    });

    res.send(resp);
};

router.get("/", getImages);
router.get("/:id", getImage);

module.exports = router;
