import express from 'express';
import { addRoles, adminRegister, addSecteur, showRoles, showSecteurs, AllUsers, AllEmp, adminLogin, createEmployeur, updateAdminProfile, addContrat, showContrats, deleteContrat, deleteRole, deleteSecteur, allOffres, deleteOffre, acceptOffre, rejectOffre, allCompanies, allOffresCompany } from '../controllers/AdminController.js';
import checkRole from '../middleware/roleCheck.js';
import checkToken from '../middleware/tokenCheck.js';

import { login } from '../controllers/AuthController.js';
import { allOffers } from '../controllers/CondidaController.js';

const route = express();

route.get('/showRoles', showRoles);
route.get('/showSecteurs', checkToken, checkRole('admin', 'employeur'), showSecteurs);
route.get('/showUsers', checkToken, checkRole('admin'), AllUsers);
route.get('/showEmps', checkToken, checkRole('admin'), AllEmp);
route.get('/showContrats', checkToken, checkRole('admin', 'employeur'), showContrats);
route.get('/allCompanies', checkToken, checkRole('admin'), allCompanies);
route.get('/allOffers', checkToken, checkRole('admin'), allOffres);
route.get('/allOffersAccepted', checkToken, checkRole('admin'), allOffers);
route.get('/offreCompany/:id', checkToken, checkRole('admin'), allOffresCompany);


route.post('/register', adminRegister);
route.post('/login', login);
route.post('/addRole', checkToken, checkRole('admin'), addRoles);
route.post('/addSecteur', checkToken, checkRole('admin'), addSecteur);
route.post('/addEmployeur', checkToken, checkRole('admin'), createEmployeur);
route.post('/addContrat', checkToken, checkRole('admin'), addContrat);


route.delete('/deleteContrat', checkToken, checkRole('admin'), deleteContrat);
route.delete('/deleteRole', checkToken, checkRole('admin'), deleteRole);
route.delete('/deleteSecteur', checkToken, checkRole('admin'), deleteSecteur);
route.delete('/deleteOffre', checkToken, checkRole('admin'), deleteOffre);

route.put('/updateProfile', checkToken, checkRole('admin', 'condidature', 'employeur'), updateAdminProfile);
route.put('/acceptOffre', checkToken, checkRole('admin'), acceptOffre);
route.put('/rejectOffre', checkToken, checkRole('admin'), rejectOffre);

export default route;