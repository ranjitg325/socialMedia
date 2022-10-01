const userModel = require("../models/userModel.js")
const emailValidator = require('validator')
const transporter = require("../utils/sendMail");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")

exports.user_signup = async (req, res) => {
    try {
        let {
            fullname,
            username,
            email,
            password,
            avatar,
            gender,
            phoneNumber,
            address,
            story,
            followers,
            following
        } = req.body;
        //let email = req.body.email;
        if (!email) {
            return res.status(400).send({ status: false, msg: " Email is required" })
        }
        const isValidEmail = emailValidator.isEmail(email)
        if (!isValidEmail) {
            return res.status(400).send({ status: false, msg: " invalid email" })
        }
        const dataExist = await userModel.findOne({ email: email });
        if (dataExist) {
            return res.status(400).send({ message: "email already in use" });
        }
        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt);
        const userRequest = {
            fullname,
            username,
            email,
            password,
            avatar,
            gender,
            phoneNumber,
            address,
            story,
            followers,
            following
        };
        const userData = await userModel.create(userRequest);
        return res
            .status(201)
            .send({ message: "User signup successfully", data: userData });
    } catch (err) {
        return res.status(500).send(err.message);
    }
};

exports.send_otp_toEmail = async (req, res) => {
    try {
        const userMail = req.body.email;
        const userData = await userModel.findOne({ email: userMail });
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

        await userModel.updateOne(
            { email: userMail },
            { $set: { mail_otp: mail_otp } }
        );

        return res
            .status(200)
            .send({ setting: { success: "1", message: "otp sent successfully" } });
    } catch (err) {
        return res.status(500).send(err.message);
    }
};

exports.login = async (req, res) => {
    try {
        const userEmail = req.body.email;
        const userOtp = req.body.otp;

        const dataExist = await userModel.findOne({ email: userEmail }).populate(
            "followers following",
            "avatar username fullname followers following"
        );

        if (!dataExist)
            return res.status(404).send({ message: "user dose not exist" });
        const { _id, firstName, lastName } = dataExist;
        const validOtp = await bcrypt.compare(userOtp, dataExist.mail_otp);
        if (!validOtp) return res.status(400).send({ message: "Invalid OTP" });
        const payload = { userId: _id, email: userEmail };
        const generatedToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, /*{  expiresIn: "10080m",}*/); //in final code push remove the comment expires in time
        res.header("jwt-token", generatedToken);
        return res
            .status(200)
            .send({
                message: `${firstName} ${lastName} you are logged in Successfully`,
                Token: generatedToken,
            });
    } catch (err) {
        return res.status(500).send(err.message);
    }
};

exports.logout = async (req, res) => {
    try {
        res.redirect("/user/login");
    } catch (err) {
        return res.status(500).send(err.message);
    }
}

exports.userUpdate = async (req, res) => {
    try {

        const userId = req.body.userId;
        let {
            fullname,
            username,
            email,
            password,
            avatar,
            gender,
            phoneNumber,
            address,
            story,
            followers,
            following,
            isDeleted
        } = req.body;
        const userData = await userModel.findOne({ _id: userId });
        if (password) {
            const salt = await bcrypt.genSalt(10);
            password = await bcrypt.hash(password, salt);
        }
        if (userData.isDeleted == true) {
            return res.status(400).send({ message: "user is not registered, register first" });
        }
        const updatedData = await userModel.findOneAndUpdate(
            { _id: userId, isDeleted: false },
            {
                fullname: fullname,
                username: username,
                email: email,
                password: password,
                avatar: avatar,
                gender: gender,
                phoneNumber: phoneNumber,
                address: address,
                story: story,
                followers: followers,
                following: following,
                isDeleted: isDeleted,
            }, { new: true }
        );
        return res
            .status(200)
            .send({ message: "user profile update successfully", data: updatedData });
    } catch (err) {
        return res.status(500).send(err.message);
    }
};

exports.getAllUser = async (req, res) => {
    try {
        let count = await userModel.find({ isDeleted: false }).count();
        const user = await userModel.find({ isDeleted: false });
        return res.status(200).send({ message: "all user list", count: count, data: user });
    } catch (err) {
        return res.status(500).send(err.message);
    }
}

exports.getUserById = async (req, res) => {
    try {
        const userId = req.body.userId;
        const user = await userModel.findById(userId);
        return res.status(200).send({ message: "user details", data: user });
    } catch (err) {
        return res.status(500).send(err.message);
    }
}


exports.searchByUsername = async (req, res) => {
    try {
        //const username = req.body.username;
        const userCount = await userModel.find({ username: { $regex: req.body.username } }).count();
        const user = await userModel.find({ username: { $regex: req.body.username } }).select("avatar username");
        if (user.length == 0) {
            return res.status(400).send({ message: "user not found" });
        }
        return res.status(200).send({ message: "user details",count:userCount, data: user });
    } catch (err) {
        return res.status(500).send(err.message);
    }
}

exports.getByUsername = async (req, res) => {
    try {
        const user = await userModel.findOne({username:req.body.username})
            .select("-password")
            .populate("followers following", "-password");
        if (!user) return res.status(400).send({ msg: "User does not exist." });
        return res.status(200).send({ message: "user details", data: user });
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
},

    exports.deleteUser = async (req, res) => {
        try {
            const userId = req.body.userId;
            const checkUser = await userModel.find({ _id: userId, isDeleted: false });
            if (checkUser) {
                const user = await userModel.updateOne({ _id: userId, isDeleted: false }, { $set: { isDeleted: true, deletedAt: Date.now() } }, { new: true });
               return res.status(200).send({ msg: "deleted successfully", data: user });
            } else {
                return res.status(400).send({ error: 'user not found' });
            }
        } catch (err) {
            return res.status(500).send(err.message);
        }
    }


exports.follow = async (req, res) => {
    try {     
        const userId = req.params.id;
        const followers = req.body.id;
        const user = await userModel.find({_id: userId,followers: followers});
        
        if (user.length > 0)
            return res.status(500).json({ msg: "You followed this user." });

        const newUser = await userModel.findOneAndUpdate(
            
            { _id: userId },
            {$push: { followers: followers }},
            { new: true }
        ).populate("followers following", "-password");
        
        await userModel.findOneAndUpdate(
            { _id: followers },
            {
                $push: { following: userId},
            },
            { new: true }
        );

        return res.status(200).send({ msg : "success" , data: newUser });
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
}

exports.unfollow= async (req, res) => {
    try {
        const userId = req.params.id;
        const followers = req.body.id;
        const newUser = await userModel.findOneAndUpdate(
            { _id: userId },
            {$pull: { followers: followers }},
            { new: true }
        ).populate("followers following", "-password");
  
        await userModel.findOneAndUpdate(
            { _id: followers },
            {
                $pull: { following: userId},
            },
            { new: true }
        );

        return res.status(200).send({ msg : "success" , data: newUser });
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
}

//   exports.suggestionsUser= async (req, res) => {
//     try {
        
//       const newArr = [...req.user.following, req.body.id];

//       const num = req.query.num || 10;

//       const users = await userModel.aggregate([
//         { $match: { _id: { $nin: newArr } } },
//         { $sample: { size: Number(num) } },
//         {
//           $lookup: {
//             from: "users",
//             localField: "followers",
//             foreignField: "_id",
//             as: "followers",
//           },
//         },
//         {
//           $lookup: {
//             from: "users",
//             localField: "following",
//             foreignField: "_id",
//             as: "following",
//           },
//         },
//       ]).project("-password");

//       return res.json({
//         users,
//         result: users.length,
//       });
//     } catch (err) {
//       return res.status(500).json({ msg: err.message });
//     }
//   }