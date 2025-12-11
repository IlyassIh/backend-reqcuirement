// test/user.test.js
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../serverTest.js";
import User from "../models/User.js";
import Role from "../models/Role.js";

let token; // will hold user token

beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    // create a role for user
    const userRole = await Role.create({ role: "condidature" });
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

describe("🧪 USER AUTH TEST", () => {

    test("POST /register → should register a new user", async () => {
        const role = await Role.findOne({ role: "condidature" });
        const res = await request(app)
            .post("/register") // adapt route if needed
            .send({
                nom: "User",
                prenom: "Tester",
                email: "user@test.com",
                password: "12345678",
                confirmPassword: "12345678",
                role: role._id
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.populatedUser).toBeDefined();
        expect(res.body.populatedUser.role_id.role).toBe("condidature");
    });

    test("POST /login → should login and return a token", async () => {
        const res = await request(app)
            .post("/login")
            .send({ email: "user@test.com", password: "12345678" });

        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();
        token = res.body.token; // store token if needed for protected routes
    });

    test("POST /login → fail with wrong password", async () => {
        const res = await request(app)
            .post("/login")
            .send({ email: "user@test.com", password: "wrongpass" });

        expect(res.statusCode).toBe(400);
    });

    test("POST /login → fail with non-existent email", async () => {
        const res = await request(app)
            .post("/login")
            .send({ email: "notexist@test.com", password: "12345678" });

        expect(res.statusCode).toBe(400);
    });

});
