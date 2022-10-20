const adminModel = require("../models/adminModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const postModel = require("../models/postModel");
const userModel = require("../models/userModel");


exports.admin_signup = async (req, res) => {
    try {
        let { firstName, lastName, email, phoneNumber, password, address } = req.body;
        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt);
        const userData = { firstName, lastName, email, phoneNumber, password, address };
        const dataCreated = await adminModel.create(userData);
        return res.status(201).send({ message: "Admin created successfully", data: dataCreated });
    } catch (err) {
        return res.status(500).send(err.message);
    }
}

exports.admin_login = async (req, res) => {
    try {
        const adminEmail = req.body.email;
        const adminPassword = req.body.password;
        const adminData = await adminModel.findOne({ email: adminEmail });
        if (adminData) {
            const { _id, firstName, lastName, password } = adminData;
            const validPassword = await bcrypt.compare(adminPassword, password);
            if (!validPassword) {
                return res.status(400).send({ message: "Invalid Password" });
            };
            let payload = { userId: _id, email: adminEmail };
            // const generatedToken = jwt.sign(payload,"sports-e-commerce",{expiresIn:'10080m'}); //i cut this line becoz error occurs "invalid signature"
            const generatedToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
                expiresIn: "10080m",
            });
            res.header("jwt-token", generatedToken);
            return res.status(200).send({ message: `${firstName} ${lastName} You are logged in`, token: generatedToken });
        } else {
            return res.status(400).send({ message: "Invalid credentials" });
        };
    } catch (err) {
        return res.status(500).send(err.message);
    };
}

exports.admin_update = async (req, res) => {
    try {
        const adminId = req.body.adminId;
        let { firstName, lastName, email, phoneNumber, password, address, isDeleted } = req.body;
        const userAdmin = await adminModel.findOne({ _id: adminId });
        if (password) {
            const salt = await bcrypt.genSalt(10);
            password = await bcrypt.hash(password, salt);
        }
        if (address) {
            if (address.street) {
                address.street = address.street;
            };
            if (address.city) {
                address.city = address.city;
            };
            if (address.pincode) {
                address.pincode = address.pincode;
            };
        }
        if (userAdmin.isDeleted == true) {
            return res.status(400).send({ message: "admin is not registered, register first" });
        }
        const newAdminData = await adminModel.findOneAndUpdate({ _id: adminId, isDeleted: false }, { firstName: firstName, lastName: lastName, email: email, password: password, phoneNumber: phoneNumber, address: address ,isDeleted:isDeleted}, { new: true });
        return res.status(200).send({ message: "Admin data updated successfully", UpdatedData: newAdminData });
    } catch (err) {
        return res.status(500).send(err.message);
    };
}

exports.getAdminById = async (req, res) => {
    try {
        const adminId = req.body.adminId;
        const adminData = await adminModel.findOne({ _id: adminId });
        return res.status(200).send({ setting: { success: "1", message: "admin data", data: adminData } });
    } catch (err) {
        return res.status(500).send(err.message);
    };
}

exports.getAllAdmins = async (req, res) => {
    try {
        const adminCount = await adminModel.find({ isDeleted: false }).count();
        const adminData = await adminModel.find({ isDeleted: false });
        return res.status(200).send({ setting: { success: "data fetched successfully", message: "admin data",count :adminCount,data: adminData } });
    } catch (err) {
        return res.status(500).send(err.message);
    };
}

exports.deleteAdmin = async (req, res) => {
    try {
        const adminId = req.body.adminId;
        const checkAdmin = await adminModel.find({ _id: adminId, isDeleted: false });
        if (checkAdmin) {
            const user = await adminModel.updateOne({ _id: adminId, isDeleted: false }, { $set: { isDeleted: true, deletedAt: Date.now() } }, { new: true });
            res.status(200).send({ msg: "admin deleted successfully", data: user });
        } else {
            res.status(400).send({ error: 'admin not found' });
        }
    } catch (err) {
        return res.status(500).send(err.message);
    }
}

exports.getReportedPosts = async (req, res) => {
    try {
        const reportedPosts = await postModel.find({ isReported: true });
        return res.status(200).send({ setting: { success: "1", message: "reported posts", data: reportedPosts } });
    } catch (err) {
        return res.status(500).send(err.message);
    };
}