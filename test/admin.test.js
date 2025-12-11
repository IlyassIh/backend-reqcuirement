import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../serverTest.js";
import Role from "../models/Role.js";
import User from "../models/User.js";
import Secteur from "../models/Secteur.js";
import Contrat from "../models/Contrat.js";
import Offre from "../models/Offre.js";
import Company from "../models/Company.js";

let token; // will hold admin token

beforeAll(async () => {
    // start in-memory MongoDB
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    // 1️⃣ create admin role
    const adminRole = await Role.create({ role: "admin" });

    // 2️⃣ register admin user
    await request(app)
        .post("/admin/register")
        .send({
            nom: "Admin",
            prenom: "Tester",
            email: "admin@test.com",
            password: "12345678",
            confirmPassword: "12345678",
            role: adminRole._id,
        });

    // 3️⃣ login admin to get token
    const res = await request(app)
        .post("/admin/login")
        .send({ email: "admin@test.com", password: "12345678" });

    token = res.body.token;
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

describe("🧪 ADMIN CONTROLLER ROUTES TEST", () => {

    // REGISTER
    test("POST /admin/register → should register a new admin", async () => {
        const adminRole = await Role.findOne({ role: "admin" });
        const res = await request(app)
            .post("/admin/register")
            .send({
                nom: "Another",
                prenom: "Admin",
                email: "second@test.com",
                password: "12345678",
                confirmPassword: "12345678",
                role: adminRole._id,
            });

        expect([201, 400]).toContain(res.statusCode);
        // 400 is acceptable if email already exists
    });

    // LOGIN
    test("POST /admin/login → should login and return a token", async () => {
        const res = await request(app)
            .post("/admin/login")
            .send({ email: "admin@test.com", password: "12345678" });

        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();
    });

    // ADD ROLE
    test("POST /admin/addRole → should add new role", async () => {
        const res = await request(app)
            .post("/admin/addRole")
            .set("Authorization", `Bearer ${token}`)
            .send({ role: "employeur" });

        expect([201, 400]).toContain(res.statusCode);
    });

    // ADD SECTEUR
    test("POST /admin/addSecteur → should add secteur", async () => {
        const res = await request(app)
            .post("/admin/addSecteur")
            .set("Authorization", `Bearer ${token}`)
            .send({ secteur: "informatique" });

        expect([201, 400]).toContain(res.statusCode);
    });

    // SHOW ROLES
    test("GET /admin/showRoles → should list all roles", async () => {
        const res = await request(app)
            .get("/admin/showRoles")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.roles).toBeDefined();
        expect(Array.isArray(res.body.roles)).toBe(true);
    });

    // SHOW SECTEURS
    test("GET /admin/showSecteurs → should list all secteurs", async () => {
        const res = await request(app)
            .get("/admin/showSecteurs")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.secteurs).toBeDefined();
    });

    // SHOW USERS
    test("GET /admin/showUsers → should return users or 404", async () => {
        const res = await request(app)
            .get("/admin/showUsers")
            .set("Authorization", `Bearer ${token}`);

        expect([200, 404]).toContain(res.statusCode);
    });

    // SHOW EMPLOYEURS
    test("GET /admin/showEmps → should return employeurs or 404", async () => {
        const res = await request(app)
            .get("/admin/showEmps")
            .set("Authorization", `Bearer ${token}`);

        expect([200, 404]).toContain(res.statusCode);
    });

    // INVALID TOKEN TEST
    test("GET /admin/showRoles → should fail without token", async () => {
        const res = await request(app).get("/admin/showRoles");
        expect(res.statusCode).toBe(401);
    });

    test("GET /admin/showRoles → should fail with wrong role", async () => {
        // create a non-admin user
        const empRole = await Role.create({ role: "employeur" });
        const emp = await User.create({
            nom: "Test",
            prenom: "User",
            email: "user@test.com",
            password: "12345678",
            role_id: empRole._id,
        });

        // manually sign token with non-admin role
        const jwt = await import("jsonwebtoken");
        const fakeToken = jwt.default.sign(
            { id: emp._id, email: emp.email, role: "employeur" },
            process.env.SECRET,
            { expiresIn: "1d" }
        );

        const res = await request(app)
            .get("/admin/showRoles")
            .set("Authorization", `Bearer ${fakeToken}`);

        expect(res.statusCode).toBe(403);
    });

    // CREATE EMPLOYEUR - PASSWORD TOO SHORT
    test("POST /admin/createEmployeur → should fail if password is less than 8 chars", async () => {
        const empRole = await Role.findOne({ role: "employeur" }) || await Role.create({ role: "employeur" });

        const res = await request(app)
            .post("/admin/addEmployeur")
            .set("Authorization", `Bearer ${token}`)
            .send({
                nom: "Test",
                prenom: "User",
                email: "shortpass@test.com",
                password: "123456", // too short
                confirmPassword: "123456",
                role: empRole._id
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.field).toBe("password");
        expect(res.body.message).toMatch(/au moins 8 caractères/i);
    });

    // CREATE EMPLOYEUR - SUCCESS
    test("POST /admin/createEmployeur → should succeed with valid password", async () => {
        const empRole = await Role.findOne({ role: "employeur" }) || await Role.create({ role: "employeur" });

        const res = await request(app)
            .post("/admin/addEmployeur")
            .set("Authorization", `Bearer ${token}`)
            .send({
                nom: "Valid",
                prenom: "User",
                email: "validuser@test.com",
                password: "12345678", // valid
                confirmPassword: "12345678",
                role: empRole._id
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.message).toMatch(/Employeur have been created successfully/i);
    });

    // ADD CONTRAT
    test("POST /admin/addContrat → should add new contrat", async () => {
        const res = await request(app)
            .post("/admin/addContrat")
            .set("Authorization", `Bearer ${token}`)
            .send({ typeContrat: "CDI" });

        expect([201, 400]).toContain(res.statusCode);
        // 201 = created
        // 400 = already exists (acceptable)
    });

    // ADD CONTRAT - MISSING FIELD
    test("POST /admin/addContrat → should fail if field missing", async () => {
        const res = await request(app)
            .post("/admin/addContrat")
            .set("Authorization", `Bearer ${token}`)
            .send({}); // missing typeContrat

        expect(res.statusCode).toBe(400);
        expect(res.body.field).toBe("typeContrat");
    });

    // SHOW CONTRATS
    test("GET /admin/showContrats → should list all contrats", async () => {
        const res = await request(app)
            .get("/admin/showContrats")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.contrats).toBeDefined();
        expect(Array.isArray(res.body.contrats)).toBe(true);
    });

    // DELETE CONTRAT - SUCCESS
    test("DELETE /admin/deleteContrat → should delete existing contrat", async () => {
        // 1️⃣ First create a contrat
        const created = await Contrat.create({ typeContrat: "CDD" });

        // 2️⃣ Delete it (send contratId in body)
        const res = await request(app)
            .delete("/admin/deleteContrat")
            .set("Authorization", `Bearer ${token}`)
            .send({ contratId: created._id.toString() }); // <-- send in body

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toMatch(/deleted successfully/i);

        // 3️⃣ Verify it's deleted
        const check = await Contrat.findById(created._id);
        expect(check).toBeNull();
    });

    // DELETE CONTRAT - NOT FOUND
    test("DELETE /admin/deleteContrat → should return 404 if contrat not found", async () => {
        const fakeId = new mongoose.Types.ObjectId();

        const res = await request(app)
            .delete("/admin/deleteContrat")
            .set("Authorization", `Bearer ${token}`)
            .send({ contratId: fakeId.toString() }); // send in body

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toMatch(/not found/i);
    });


    // DELETE ROLE - SUCCESS
    test("DELETE /admin/deleteRole → should delete existing role", async () => {
        // 1️⃣ create a role
        const role = await Role.create({ role: "testRoleToDelete" });

        // 2️⃣ delete it (send roleId in body)
        const res = await request(app)
            .delete("/admin/deleteRole")
            .set("Authorization", `Bearer ${token}`)
            .send({ roleId: role._id.toString() }); // <-- send in body

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toMatch(/deleted successfully/i);

        // 3️⃣ verify deletion
        const check = await Role.findById(role._id);
        expect(check).toBeNull();
    });


    // DELETE ROLE - NOT FOUND
    test("DELETE /admin/deleteRole → should return 404 if role not found", async () => {
        const fakeId = new mongoose.Types.ObjectId();

        const res = await request(app)
            .delete("/admin/deleteRole")
            .set("Authorization", `Bearer ${token}`)
            .send({ roleId: fakeId.toString() }); // <-- send in body

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toMatch(/Role not found/i);
    });


    // DELETE SECTEUR - SUCCESS
    // DELETE SECTEUR - SUCCESS
    test("DELETE /admin/deleteSecteur → should delete existing secteur", async () => {
        // 1️⃣ create secteur
        const secteur = await Secteur.create({ secteur: "testSecteurToDelete" });

        // 2️⃣ delete it (send secteurId in body)
        const res = await request(app)
            .delete("/admin/deleteSecteur")
            .set("Authorization", `Bearer ${token}`)
            .send({ secteurId: secteur._id.toString() }); // <-- send in body

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toMatch(/deleted successfully/i);

        // 3️⃣ verify deletion
        const check = await Secteur.findById(secteur._id);
        expect(check).toBeNull();
    });

    // DELETE SECTEUR - NOT FOUND
    test("DELETE /admin/deleteSecteur → should return 404 if secteur not found", async () => {
        const fakeId = new mongoose.Types.ObjectId();

        const res = await request(app)
            .delete("/admin/deleteSecteur")
            .set("Authorization", `Bearer ${token}`)
            .send({ secteurId: fakeId.toString() }); // <-- send in body

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toMatch(/Secteur not found/i);
    });


    // GET all offres
    test("GET /admin/allOffres → should return all offres", async () => {
        const res = await request(app)
            .get("/admin/allOffres")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.offres).toBeDefined();
        expect(Array.isArray(res.body.offres)).toBe(true);
    });

    const fakeOffreData = {
        typecontrat_id: new mongoose.Types.ObjectId(),
        secteur_id: new mongoose.Types.ObjectId(),
        company_id: new mongoose.Types.ObjectId(),
        salaire: 3000,
        description: "Test description",
        offre: "Test offre",
        status: false   // 👈 default false
    };


    // ACCEPT offre
    test("PUT /admin/acceptOffre → should accept offre", async () => {
        const offre = await Offre.create(fakeOffreData);

        const res = await request(app)
            .put(`/admin/acceptOffre`)
            .set("Authorization", `Bearer ${token}`)
            .send({ offreId: offre._id }); // ✔ envoyer l'ID ici

        expect(res.statusCode).toBe(200);
        expect(res.body.offre.status).toBe(true); // ✔ devient true
    });



    // REJECT offre
    test("PUT /admin/rejectOffre → should reject offre", async () => {
        const offre = await Offre.create(fakeOffreData);

        const res = await request(app)
            .put(`/admin/rejectOffre`)
            .set("Authorization", `Bearer ${token}`)
            .send({ offreId: offre._id }); // 🔥 envoyer dans le body

        expect(res.statusCode).toBe(200);
        expect(res.body.offre.status).toBe(false);
    });



    // DELETE offre - success
    test("DELETE /admin/deleteContrat → should delete contrat", async () => {
        // create a fake contrat
        const contrat = await Contrat.create({ typeContrat: "CDI" });

        // make request with contratId in body
        const res = await request(app)
            .delete("/admin/deleteContrat")
            .set("Authorization", `Bearer ${token}`)
            .send({ contratId: contrat._id.toString() });

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toMatch(/deleted successfully/i);

        // check in DB
        const check = await Contrat.findById(contrat._id);
        expect(check).toBeNull();
    });


    // DELETE offre - not found
    test("DELETE /admin/deleteOffre/:id → should return 404 if not found", async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .delete(`/admin/deleteOffre/${fakeId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toMatch(/not found/i);
    });

    test("GET /admin/allCompanies → should return all companies with populated user", async () => {
        // 1️⃣ Créer un rôle employeur
        const role = await Role.create({ role: "employeur" });

        // 2️⃣ Créer un user complet
        const user = await User.create({
            nom: "Ilyass",
            prenom: "Hassan",
            email: "user1@test.com", // unique
            password: "12345678",
            role_id: role._id
        });

        // 3️⃣ Créer la company
        const company = await Company.create({
            company: "TechCorp",
            user_id: user._id
        });

        // 4️⃣ Créer un admin et token si pas déjà créé
        const adminRole = await Role.findOne({ role: "admin" }) || await Role.create({ role: "admin" });
        const admin = await User.findOne({ email: "admin@test.com" }) || await User.create({
            nom: "Admin",
            prenom: "Tester",
            email: "admin@test.com",
            password: "12345678",
            role_id: adminRole._id
        });

        // 🔹 Token avec rôle admin pour passer le middleware
        const jwt = await import("jsonwebtoken");
        const token = jwt.default.sign(
            { id: admin._id, role: "admin" }, // 🔹 role ajouté ici
            process.env.SECRET,
            { expiresIn: "1d" }
        );

        // 5️⃣ Appel du endpoint
        const res = await request(app)
            .get("/admin/allCompanies")
            .set("Authorization", `Bearer ${token}`);

        // 6️⃣ Assertions
        console.log(res.body); // pour debug si besoin
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.companies)).toBe(true);
        expect(res.body.companies.length).toBeGreaterThan(0);

        const returnedCompany = res.body.companies[0];
        expect(returnedCompany.company).toBe("TechCorp");
        expect(returnedCompany.user_id.nom).toBe("Ilyass");
        expect(returnedCompany.user_id.prenom).toBe("Hassan");
        expect(returnedCompany.user_id._id).toBeUndefined();
    });





});
