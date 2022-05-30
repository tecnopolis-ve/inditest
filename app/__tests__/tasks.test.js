const supertest = require("supertest");
const server = require("../server");

const api = supertest(server);

describe("Task endpoint", () => {
    beforeEach(() => jest.clearAllMocks());

    it("[KO] Post images will fail", async () => {
        const res = await api.post("/task").send();
        expect(res.statusCode).toEqual(400);
    });

    afterAll(() => {
        server.close();
    });
});
