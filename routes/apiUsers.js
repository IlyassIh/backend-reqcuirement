import express from 'express';
import { login, register } from '../controllers/AuthController.js';
import checkRole from '../middleware/roleCheck.js';
import checkToken from '../middleware/tokenCheck.js';
import { allCompanies, allOffersUser, allOffresComp, createCompany, createOffre, deleteAccount, deleteCompany, deleteOffre, showApplies, updateCompany, updateOffre, updateProfile } from '../controllers/EmloyeurController.js';
import { allOffers, companiesUser, postuler, viewOffre } from '../controllers/CondidaController.js';

const route = express();

route.get('/allOffersUser', checkToken, checkRole('employeur'), allOffersUser);
route.get('/allOffers', checkToken, checkRole('condidature'), allOffers);
route.get('/allCompanies', checkToken, checkRole('employeur'), allCompanies);
route.get('/applies', checkToken, checkRole('employeur'), showApplies);
route.get('/companyUser', checkToken, checkRole('employeur'), companiesUser);
route.get('/viewOffer/:id', checkToken, checkRole('condidature', 'employeur'), viewOffre);
route.get('/allOffers/:id', checkToken, checkRole('employeur'), allOffresComp);

route.post('/register', register);
route.post('/login', login);
route.post('/createCompany', checkToken, checkRole('employeur'), createCompany);
route.post('/createOffre', checkToken, checkRole('employeur'), createOffre);
route.post('/apply', checkToken, checkRole('condidature'), postuler);

route.put('/updateProfile', checkToken, checkRole('employeur', 'condidature'), updateProfile);
route.put('/updateOffre/:id', checkToken, checkRole('employeur'), updateOffre);
route.put('/updateCompany/:id', checkToken, checkRole('employeur'), updateCompany);

route.delete('/deleteCompany', checkToken, checkRole('employeur'), deleteCompany);
route.delete('/deleteAccount', checkToken, checkRole('employeur', 'condidature'), deleteAccount);
route.delete('/deleteOffre/:id', checkToken, checkRole('employeur'), deleteOffre);

export default route;