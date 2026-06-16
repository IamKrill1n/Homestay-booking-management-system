import { M_User } from "../models/M_User.js";
import * as userRepo from "../repositories/userRepository.js";

// create : success 201 | fail 400
// read   : success 200 | fail 500 | empty 404
// update : success 200 | fail 400 | empty 204
// delete : success 200 | fail 500 | empty 204

class C_User {
  async register(req, res) {
    try {
      const fieldList = req.body;

      const validation = M_User.validateRegistration(fieldList);
      if (!validation.valid) {
        return res.status(400).json({
          status: "error",
          message: validation.message
        });
      }

      const existingUser = await userRepo.findUserByEmail(fieldList.email);
      if (existingUser) {
        return res.status(409).json({
          status: "error",
          message: "A user account with this email address already exists."
        });
      }

      const requestedRole = String(fieldList.role || "common").toLowerCase();
      if (requestedRole === "admin") {
        return res.status(400).json({
          status: "error",
          message: "Admin accounts cannot be created through public registration."
        });
      }

      if (requestedRole === "owner" && (!fieldList.bankAccountNumber || String(fieldList.bankAccountNumber).trim() === "")) {
        return res.status(400).json({
          status: "error",
          message: "Bank account number is required for owner registration."
        });
      }

      const newUser = new M_User(fieldList);

      const createdUser = await userRepo.createUserWithRole(newUser, {
        bankAccountNumber: fieldList.bankAccountNumber,
      });

      return res.status(201).json({
        status: "success",
        message: "User registration completed successfully.",
        user: createdUser.toSafeJSON()
      });

    } catch (error) {
      console.error("Controller Exception in register:", error);
      return res.status(500).json({
        status: "error",
        message: "An internal server error occurred during account registration."
      });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          status: "error",
          message: "Both email and password are required fields."
        });
      }

      const userInstance = await userRepo.findUserByEmail(email);

      if (!userRepo.verifyPassword(password, userInstance)) {
        return res.status(401).json({
          status: "error",
          message: "Invalid email or password credentials."
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Authentication successful.",
        user: userInstance.toSafeJSON()
      });

    } catch (error) {
      console.error("Controller Exception in login:", error);
      return res.status(500).json({
        status: "error",
        message: "An internal server error occurred during logging in."
      });
    }
  }

  async getProfile(req, res) {
    try {
      const { id } = req.params;

      const userInstance = await userRepo.findUserByID(id);
      if (!userInstance) {
        return res.status(404).json({
          status: "error",
          message: "User profile not found."
        });
      }

      return res.status(200).json(userInstance.toSafeJSON());

    } catch (error) {
      console.error("Controller Exception in getProfile:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to locate user profile information."
      });
    }
  }

  async updateProfile(req, res) {
    try {
      const targetUserId = req.params.id || req.user?.userID || req.body.userID;
      const incomingUpdates = req.body;

      if (!targetUserId) {
        return res.status(401).json({
          status: "error",
          message: "Unauthorized: Missing account identifier validation keys."
        });
      }

      const rawUser = await userRepo.findUserByID(targetUserId);
      if (!rawUser) {
        return res.status(4404).json({
          status: "error",
          message: "User account records could not be found."
        });
      }

      const userInstance = new M_User(rawUser);

      if (incomingUpdates.email && incomingUpdates.email !== userInstance.email) {
        const emailOwner = await userRepo.findUserByEmail(incomingUpdates.email);
        
        if (emailOwner && String(emailOwner.user_id) !== String(targetUserId)) {
          return res.status(409).json({
            status: "error",
            message: "A user account with this email address already exists."
          });
        }
      }

      const mutationResult = userInstance.editProfile(incomingUpdates);
      if (!mutationResult.valid) {
        return res.status(400).json({
          status: "error",
          message: mutationResult.message
        });
      }

      const updatedRecord = await userRepo.updateUser(userInstance.toSafeJSON());

      return res.status(200).json({
        status: "success",
        message: "Profile updated successfully.",
        user: updatedRecord
      });

    } catch (error) {
      console.error("Controller Exception in updateProfile:", error);
      return res.status(500).json({
        status: "error",
        message: "An internal server error occurred while updating the profile configuration."
      });
    }
  }

  async deleteAccount(req, res) {
    try {
      const { id } = req.params;

      const userInstance = await userRepo.findUserByID(id);
      if (!userInstance) {
        return res.status(404).json({
          status: "error",
          message: "Deletion failed. User account could not be found."
        });
      }

      const wasDeleted = await userRepo.deleteUserByID(id);

      if (!wasDeleted) {
        return res.status(400).json({
          status: "error",
          message: "Account deletion could not be executed."
        });
      }

      return res.status(200).json({
        status: "success",
        message: "The user account and all associated records have been permanently deleted."
      });

    } catch (error) {
      console.error("Controller Exception in deleteAccount:", error);
      return res.status(500).json({
        status: "error",
        message: "An internal server error occurred while deleting the account."
      });
    }
  }

}

export default new C_User();
