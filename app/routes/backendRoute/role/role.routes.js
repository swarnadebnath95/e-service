const express = require('express');
const roleController = require('../../../module/backend_module/role/controller/role.controller');

const roleRouter = express.Router()

roleRouter.post("/create", roleController.createRole);
roleRouter.get('/getAll', roleController.getAllRoles);
roleRouter.get('/getRoleById/:id', roleController.getRoleById);
roleRouter.post('/updateRoleById/:id', roleController.updateRole);
roleRouter.get('/deleteRole/:id', roleController.deleteRole);



module.exports = roleRouter;

