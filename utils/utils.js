const sharp = require("sharp");
const path = require("path");

const getFilenameAndExtension = (pathfilename) => {
    return [path.parse(pathfilename).name, path.parse(pathfilename).ext];
};

const getImageInfo = async (image) => {
    const readImg = sharp(image);
    return await readImg.metadata();
};

module.exports = {
    getFilenameAndExtension,
    getImageInfo,
};
