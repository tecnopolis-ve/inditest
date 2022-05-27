const request = require("supertest");
const app = require("../server");
const Image = require("../models").Image;

describe("Images endpoints", () => {
    beforeEach(() => jest.clearAllMocks());

    it("[OK] Get images", async () => {
        jest.spyOn(Image, "findAll").mockResolvedValueOnce([
            { id: 1, path: "fake" },
            { id: 2, path: "fake" },
        ]);

        const res = await request(app).get("/image").send();
        expect(res.statusCode).toEqual(200);
    });

    it("[KO] Get image by bad id", async () => {
        jest.spyOn(Image, "findOne").mockResolvedValueOnce(null);

        const res = await request(app).get("/image/not-valid-id").send();
        expect(res.statusCode).toEqual(404);
    });
});
