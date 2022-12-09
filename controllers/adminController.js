const adminModel = require("../models/adminModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const postModel = require("../models/postModel");
const commentModel = require("../models/commentModel")
const userModel = require("../models/userModel");
const pageModel = require("../models/pageModel");
const organiseEventModel = require("../models/organiseEventModel");

exports.admin_signup = async (req, res) => {
    try {
        let {
            firstName,
            lastName,
            phoneNumber,
            password,
            address
        } = req.body;
        let email = req.body.email;
        if (!email) {
            return res.status(400).send({ status: false, msg: " Email is required" })
        }
        const isValidEmail = emailValidator.isEmail(email)
        if (!isValidEmail) {
            return res.status(400).send({ status: false, msg: " invalid email" })
        }
        const dataExist = await adminModel.findOne({ email: email });
        if (dataExist) {
            return res.status(400).send({ message: "email already in use" });
        }

        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt);

        const userData = {
            firstName,
            lastName,
            email,
            phoneNumber,
            password,
            address
        };
        const dataCreated = await adminModel.create(userData);
        return res.status(201).send({ message: "Admin created successfully", data: dataCreated });
    } catch (err) {
        return res.status(500).send(err.message);
    }
}

exports.send_otp_toEmail = async (req, res) => {
    try {
        const userMail = req.body.email;
        const userData = await adminModel.findOne({ email: userMail });
        if (!userData) {
            return res
                .status(400)
                .send({ setting: { success: "0", message: "not valid user" } });
        }
        let mail_otp = otpGenerator.generate(4, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false,
        });

        console.log(process.env.AUTH_EMAIL, process.env.AUTH_PASS);
        await transporter.sendMail({
            from: process.env.AUTH_EMAIL,
            to: userMail,
            subject: "OTP",
            text: `Your OTP is ${mail_otp} to login into your account`,
        });

        const salt = await bcrypt.genSalt(10);
        mail_otp = await bcrypt.hash(mail_otp, salt);

        await adminModel.updateOne(
            { email: userMail },
            { $set: { mail_otp: mail_otp } }
        );

        return res
            .status(200)
            .send({ setting: { success: "1", message: "otp sent successfully" } });
    } catch (err) {
        return res.status(500).send(err.message);
    }
}

// exports.login = async (req, res) => {
//     try {
//         const userEmail = req.body.email;
//         const userOtp = req.body.otp;

//         const dataExist = await adminModel.findOne({ email: userEmail });
//         if (!dataExist)
//             return res.status(404).send({ message: "admin does not exist" });
//         const { _id, firstName, lastName } = dataExist;

//         const validOtp = await bcrypt.compare(userOtp, dataExist.mail_otp);
//         if (!validOtp) return res.status(400).send({ message: "Invalid OTP" });
        
//         const payload = { adminId: _id, email: userEmail };
//         const generatedToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, /*{  expiresIn: "10080m",}*/); //in final code push remove the comment expires in time
//         res.header("jwt-token", generatedToken);
//         return res
//             .status(200)
//             .send({
//                 message: `${firstName} ${lastName} you are logged in Successfully`,
//                 Token: generatedToken,
//             });
//     } catch (err) {
//         return res.status(500).send(err.message);
//     }
// };
exports.login = async (req, res) => {
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

exports.logout = async (req, res) => {
    try {
      res.clearCookie("jwt");
      res.status(200).send("admin Logout");
    } catch (err) {
      return res.status(500).send(err.message);
    }
  }

  exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const customerData = await adminModel.findOne({ email: email });
        if (!customerData) {
            return res.status(400).send({ message: "email is not valid" });
        }
        const otp = Math.floor(100000 + Math.random() * 900000);
        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: "Forgot Password",
            html: `<h1>OTP for forgot password is ${otp}</h1>`,
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("Email sent: " + info);
            }
        });
        await adminModel.findOneAndUpdate(
            { email: email },
            { otp: otp, otpTime: Date.now() }
        );
        return res.status(200).send({ message: "OTP sent to your email", email });
    } catch (err) {
        return res.status(500).send(err.message);
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const { email, otp, password } = req.body;
        const customerData = await adminModel.findOne({ email: email });
        if (!customerData) {
            return res.status(400).send({ message: "email is not valid" });
        }
        if (!otp) {
            return res.status(400).send({ message: "otp is required" });
        }
        if (customerData.otp == otp) {
            if (Date.now() - customerData.otpTime > 300000) {
                return res.status(400).send({ message: "OTP expired" });
            }
            const salt = await bcrypt.genSalt(10);
            const newPassword = await bcrypt.hash(password, salt);
            await adminModel.findOneAndUpdate(
                { email: email },
                { password: newPassword }
            );
            return res
                .status(200)
                .send({ message: "Password updated successfully" });
        }
        else {
            return res.status(400).send({ message: "OTP is not correct" });
        }
    } catch (err) {
        return res.status(500).send(err.message);
    }
};

exports.admin_update = async (req, res) => {
    try {
        const adminId = req.user.userId;
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
        const newAdminData = await adminModel.findOneAndUpdate({ _id: adminId, isDeleted: false }, { firstName: firstName, lastName: lastName, email: email, password: password, phoneNumber: phoneNumber, address: address, isDeleted: isDeleted }, { new: true });
        return res.status(200).send({ message: "Admin data updated successfully", UpdatedData: newAdminData });
    } catch (err) {
        return res.status(500).send(err.message);
    };
}

exports.getAdminById = async (req, res) => {
    try {
        const adminId = req.user.userId;
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
        return res.status(200).send({ setting: { success: "data fetched successfully", message: "admin data", count: adminCount, data: adminData } });
    } catch (err) {
        return res.status(500).send(err.message);
    };
}

exports.deleteAdmin = async (req, res) => {
    try {
        const adminId = req.user.userId;
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
        const reportedPosts = await postModel.find({ isReported: true , isDeleted: false});
        return res.status(200).send({ setting: { success: "1", message: "reported posts", data: reportedPosts } });
    } catch (err) {
        return res.status(500).send(err.message);
    };
}

//get reported events by admin only
exports.getReportedEvents = async (req, res) => {
    try {
        const reportedEvents = await organiseEventModel.find({ isReported: true, isDeleted: false });
        return res.status(200).send({ setting: { success: "1", message: "reported events", data: reportedEvents } });
    } catch (err) {
        return res.status(500).send(err.message);
    };
}

//get reported events count
exports.getReportedEventsCount = async (req, res) => {
    try {
        const reportedEventsCount = await organiseEventModel.find({ isReported: true, isDeleted: false }).count();
        return res.status(200).send({ setting: { success: "1", message: "reported events count", data: reportedEventsCount } });
    } catch (err) {
        return res.status(500).send(err.message);
    };
}

//reported posts can be deleted by admin only
exports.deleteReportedPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const adminId = req.user.userId;
        const checkPost = await postModel.findById({ _id: postId });
        if(!checkPost){
            return res.status(400).send({ message: "post not found" });
        }
        const checkAdmin = await adminModel.findById({ _id: adminId });
        if (checkAdmin) {
            const post = await postModel.updateOne({ _id: postId, isReported: true }, { $set: { isDeleted: true, deletedAt: Date.now() } }, { new: true });
            res.status(200).send({ msg: "post deleted successfully", data: post });
        } else {
            res.status(400).send({ error: 'admin not found' });
        }
    } catch (err) {
        return res.status(500).send(err.message);
    }
}

//only admin can delete reported events
exports.deleteReportedEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const adminId = req.user.userId;
        const checkEvent = await organiseEventModel.findById({ _id: eventId });
        const checkAdmin = await adminModel.findById({ _id: adminId });
        if (checkEvent && checkAdmin) {
            const event = await organiseEventModel.updateOne({ _id: eventId, isReported: true }, { $set: { isDeleted: true, deletedAt: Date.now() } }, { new: true });
            res.status(200).send({ msg: "event deleted successfully", data: event });
        } else {
            res.status(400).send({ error: 'event not found or you are not admin' });
        }
    } catch (err) {
        return res.status(500).send(err.message);
    }
}

//admin can delete any post
exports.deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const adminId = req.user.userId;
        const checkPost = await postModel.findById({ _id: postId });
        const checkAdmin = await adminModel.findById({ _id: adminId, isDeleted: false });
        if (checkPost && checkAdmin) {
              const post = await postModel.updateOne({ _id: postId }, { $set: { isDeleted: true, deletedAt: Date.now() } }, { new: true });
            res.status(200).send({ msg: "post deleted successfully", data: post });
        } else {
            res.status(400).send({ error: 'post not found or you are not admin' });
        }
    } catch (err) {
        return res.status(500).send(err.message);
    }
}

//admin can delete any event
exports.deleteEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const adminId = req.user.userId;
        const checkEvent = await organiseEventModel.findById({ _id: eventId });
        const checkAdmin = await adminModel.findById({ _id: adminId, isDeleted: false });
        if (checkEvent && checkAdmin) {
            const event = await organiseEventModel.updateOne({ _id: eventId }, { $set: { isDeleted: true, deletedAt: Date.now() } }, { new: true });
            res.status(200).send({ msg: "event deleted successfully", data: event });
        } else {
            res.status(400).send({ error: 'event not found or you are not the admin' });
        }
    } catch (err) {
        return res.status(500).send(err.message);
    }
}

//admin can delete any user
exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const adminId = req.user.userId;
        const checkUser = await userModel.findById({ _id: userId });
        const checkAdmin = await adminModel.findById({ _id: adminId, isDeleted: false });
        if (checkUser && checkAdmin) {
            const user = await userModel.updateOne({ _id: userId }, { $set: { isDeleted: true, deletedAt: Date.now() } }, { new: true });
            res.status(200).send({ msg: "user deleted successfully", data: user });
        } else {
            res.status(400).send({ error: 'user not found or you are not admin' });
        }
    } catch (err) {
        return res.status(500).send(err.message);
    }
}

//admin can delete any page
exports.deletePage = async (req, res) => {
    try {
        const pageId = req.params.id;
        const adminId = req.user.userId;
        const checkPage = await pageModel.findById({ _id: pageId });
        const checkAdmin = await adminModel.findById({ _id: adminId, isDeleted: false });
        if (checkPage && checkAdmin) {
            const page = await pageModel.updateOne({ _id: pageId }, { $set: { isDeleted: true, deletedAt: Date.now() } }, { new: true });
            res.status(200).send({ msg: "page deleted successfully", data: page });
        } else {
            res.status(400).send({ error: 'page not found or you are not admin' });
        }
    } catch (err) {
        return res.status(500).send(err.message);
    }
}