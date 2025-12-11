import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import app from "../serverTest.js";

import Role from "../models/Role.js";
import User from "../models/User.js";
import Secteur from "../models/Secteur.js";
import Contrat from "../models/Contrat.js";
import Company from "../models/Company.js";
import Offre from "../models/Offre.js";

let token;
let secteurId;
let contratId;
let createdCompanyId;
let createdOffreId;

beforeAll(async () => {
    // Start in-memory MongoDB
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    // 1️⃣ Create roles
    const empRole = await Role.create({ role: "employeur" });

    // 2️⃣ Register employeur
    await request(app)
        .post("/register")
        .send({
            nom: "Emp",
            prenom: "User",
            email: "emp@test.com",
            password: "12345678",
            confirmPassword: "12345678",
            role: empRole._id,
        });

    // 3️⃣ Login → get token
    const resLogin = await request(app)
        .post("/login")
        .send({ email: "emp@test.com", password: "12345678" });

    token = resLogin.body.token;

    // 4️⃣ Create secteur
    const secteur = await Secteur.create({ secteur: "IT" });
    secteurId = secteur._id;

    // 5️⃣ Create contrat
    const contrat = await Contrat.create({ typeContrat: "CDI" });
    contratId = contrat._id;
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

// ===================================================================
// EMPLOYEUR ROUTES TEST
// ===================================================================
describe("🧪 EMPLOYEUR ROUTES TEST", () => {

    // CREATE COMPANY ------------------------------------------------
    test("POST /createCompany → should create a new company", async () => {

        const res = await request(app)
            .post("/createCompany")
            .set("Authorization", `Bearer ${token}`)
            .send({ nameCompany: "TechCorp" });

        expect(res.statusCode).toBe(201);
        expect(res.body.companyCreate).toBeDefined();
        expect(res.body.companyCreate.company).toBe("TechCorp");

        createdCompanyId = res.body.companyCreate._id;

        const check = await Company.findOne({ company: "TechCorp" });
        expect(check).not.toBeNull();
    });

    test("POST /createCompany → should fail if name missing", async () => {

        const res = await request(app)
            .post("/createCompany")
            .set("Authorization", `Bearer ${token}`)
            .send({});

        expect(res.statusCode).toBe(400);
        expect(res.body.field).toBe("nameCompany");
    });

    // CREATE OFFRE --------------------------------------------------
    test("POST /createOffre → should create offre", async () => {

        const res = await request(app)
            .post("/createOffre")
            .set("Authorization", `Bearer ${token}`)
            .send({
                offre: "Développeur",
                desc: "Création du site",
                salaire: 6000,
                secteur_id: secteurId,
                contrat: contratId
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.offreCreate).toBeDefined();
        expect(res.body.offreCreate.offre).toBe("Développeur");

        createdOffreId = res.body.offreCreate._id;

        const check = await Offre.findOne({ offre: "Développeur" });
        expect(check).not.toBeNull();
    });

    test("POST /createOffre → should fail if offre missing", async () => {

        const res = await request(app)
            .post("/createOffre")
            .set("Authorization", `Bearer ${token}`)
            .send({
                desc: "desc",
                salaire: 5000,
                secteur_id: secteurId
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.field).toBe("offre");
    });

    // DELETE OFFRE --------------------------------------------------
    test("DELETE /deleteOffre → should delete offre", async () => {
        const res = await request(app)
            .delete(`/deleteOffre?offreId=${createdOffreId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Offre deleted successfully");

        const check = await Offre.findById(createdOffreId);
        expect(check).toBeNull();
    });

    // DELETE COMPANY + AUTO DELETE OFFRES ----------------------------
    test("DELETE /deleteCompany → should delete company and all its offers", async () => {

        // Create new offer for deletion test
        await Offre.create({
            offre: "Backend Dev",
            description: "Test Offre",
            salaire: 5000,
            status: false,
            company_id: createdCompanyId,
            secteur_id: secteurId,
            typecontrat_id: contratId
        });

        const res = await request(app)
            .delete("/deleteCompany")
            .set("Authorization", `Bearer ${token}`)
            .send({ companyId: createdCompanyId });

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Company and all related offers deleted successfully");

        // Check company removed
        const companyCheck = await Company.findById(createdCompanyId);
        expect(companyCheck).toBeNull();

        // Check all offers removed
        const offresCheck = await Offre.find({ company_id: createdCompanyId });
        expect(offresCheck.length).toBe(0);
    });

});
