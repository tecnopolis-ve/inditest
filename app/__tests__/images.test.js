const supertest = require("supertest");
const server = require("../server");
const Image = require("../models").Image;

const api = supertest(server);

describe("Images endpoints", () => {
    beforeEach(() => jest.clearAllMocks());

    it("[OK] Get images", async () => {
        jest.spyOn(Image, "findAll").mockResolvedValueOnce([
            { id: 1, path: "fake" },
            { id: 2, path: "fake" },
        ]);

        const res = await api.get("/image").send();
        expect(res.statusCode).toEqual(200);
    });

    it("[KO] Get image by bad id", async () => {
        jest.spyOn(Image, "findOne").mockResolvedValueOnce(null);

        const res = await api.get("/image/not-valid-id").send();
        expect(res.statusCode).toEqual(404);
    });

    afterAll(() => {
        server.close();
    });
});
