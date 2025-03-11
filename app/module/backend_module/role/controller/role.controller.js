const Role = require('../model/role.model')

class RoleController {
  // Create a new role with permissions
   async createRole(req, res) {
    try {
      const { name, permissions } = req.body;

      if (!name || !permissions || !Array.isArray(permissions)) {
        return res.status(400).json({ message: "Invalid input data" });
      }
      const existingRole = await Role.findOne({ name });
      if (existingRole) {
        return res.status(400).json({ message: "Role already exists" });
      }

      const role = new Role({ name, permissions });
      await role.save();

      res.status(201).json({ message: "Role created successfully", role });
    } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  }

  // Get all roles
   async getAllRoles(req, res) {
    try {
      const roles = await Role.find();
      res.status(200).json(roles);
    } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  }

  // Get a single role by ID
   async getRoleById(req, res) {
    try {
      const role = await Role.findById(req.params.id);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }
      res.status(200).json(role);
    } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  }

  // Update a role
   async updateRole(req, res) {
    try {
      const { name, permissions } = req.body;
      const role = await Role.findByIdAndUpdate(
        req.params.id,
        { name, permissions },
        { new: true, runValidators: true }
      );

      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }

      res.status(200).json({ message: "Role updated successfully", role });
    } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  }

  // Delete a role
   async deleteRole(req, res) {
    try {
      const role = await Role.findByIdAndDelete(req.params.id);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }

      res.status(200).json({ message: "Role deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  }
}

module.exports = new RoleController();
