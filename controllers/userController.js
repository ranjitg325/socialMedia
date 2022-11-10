const userModel = require("../models/userModel.js")
const postModel = require("../models/postModel.js");
const emailValidator = require("validator")
const transporter = require("../utils/sendMail");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const aws = require('../aws/aws')
const middleware = require("../middleware/authenticateUser");
//const aws = require('../awsBucket')


// exports.user_signup = async function (req, res) {
//     try {
//         let {
//             fullname,
//             username,
//             //email,
//             password,
//             //avatar,
//             gender,
//             phoneNumber,
//             address,
//             story,
//             followers,
//             following
//         } = req.body;
//         const { email } = req.body
//         let profileImage = req.files;
//        // let email = req.body.email;
//         // if (!email) {
//         //     return res.status(400).send({ status: false, msg: " Email is required" })
//         // }
//         // const isValidEmail = emailValidator.isEmail(email)
//         // if (!isValidEmail) {
//         //     return res.status(400).send({ status: false, msg: " invalid email" })
//         // }
//         // const dataExist = await userModel.findOne({ email: email });
//         // if (dataExist) {
//         //     return res.status(400).send({ message: "email already in use" });
//         // }
//         if(!email){
//             return res.status(400).send({ status: false, msg: " email is required" })
//         }

//         let validemail = await userModel.findOne({ email :email })
//         if (validemail) {
//             return res.status(400).send({ status: false, msg: "email id is already exist" })
//         }

//         const isValidEmail = emailValidator.isEmail(email)
//         if (!isValidEmail) {
//              return res.status(400).send({ status: false, msg: " invalid email" })
//         }
//         if (profileImage && profileImage.length > 0) {
//             profileImage = await aws.uploadFile(profileImage[0]);
//             }
//             // else {
//             //     return res.status(400).send({ status: false, message: "profileImage is required" })
//             // }
//         const salt = await bcrypt.genSalt(10);
//         password = await bcrypt.hash(password, salt);
//         const userRequest = {
//             fullname,
//             username,
//             email,
//             password,
//             profileImage,
//             gender,
//             phoneNumber,
//             address,
//             story,
//             followers,
//             following
//         };
//         const userData = await userModel.create(userRequest);
//         return res
//             .status(201)
//             .send({ message: "User signup successfully", data: userData });
//     } catch (err) {
//         return res.status(500).send(err.message);
//     }
// };

exports.user_signup = async function (req, res) {
    try {
    //if image path is given then run this code else run else code
        if (req.files && req.files.length > 0) {
        let {
            fullname,
            username,
            password,
            gender,
            phoneNumber,
            address,
            story,
            followers,
            following
        } = req.body;
        const { email } = req.body
        let avatar = req.files;

        if (!email) {
            return res.status(400).send({ status: false, msg: " email is required" })
        }

        let validemail = await userModel.findOne({ email })
        if (validemail) {
            return res.status(400).send({ status: false, msg: "email id is already exist" })
        }

        const isValidEmail = emailValidator.isEmail(email)
        if (!isValidEmail) {
            return res.status(400).send({ status: false, msg: " invalid email" })
        }
        if (avatar && avatar.length > 0) {
            avatar = await aws.uploadFile(avatar[0]);
        }
        else {
            return res.status(400).send({ status: false, message: "profileImage or avatar is required" })
        }

        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt)

        let finalData = {
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
        const userData = await userModel.create(finalData);
        res.status(201).send({ status: true, data: userData });
    }
else {
    let {
        fullname,
        username,
        password,
        gender,
        phoneNumber,
        address,
        story,
        followers,
        following
    } = req.body;
    const { email } = req.body

    if (!email) {
        return res.status(400).send({ status: false, msg: " email is required" })
    }

    let validemail = await userModel.findOne({ email })
    if (validemail) {
        return res.status(400).send({ status: false, msg: "email id is already exist" })
    }

    const isValidEmail = emailValidator.isEmail(email)
    if (!isValidEmail) {
        return res.status(400).send({ status: false, msg: " invalid email" })
    }

    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt)

    let finalData = {
        fullname,
        username,
        email,
        password,
        gender,
        phoneNumber,
        address,
        story,
        followers,
        following
    };
    const userData = await userModel.create(finalData);
    res.status(201).send({ status: true, data: userData });
}
}
    catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, msg: error.message })
    }
}



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
        ).select("-password");

        if (!dataExist)
            return res.status(404).send({ message: "user dose not exist" });
        const { _id, fullname } = dataExist;
        const validOtp = await bcrypt.compare(userOtp, dataExist.mail_otp);
        if (!validOtp) return res.status(400).send({ message: "Invalid OTP" });
        const payload = { userId: _id, email: userEmail };
        const generatedToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, /*{  expiresIn: "10080m",}*/); //in final code push remove the comment expires in time
        res.header("jwt-token", generatedToken);
        return res
            .status(200)
            .send({
                message: `${fullname} you are logged in Successfully`,
                Token: generatedToken,
                userDetails: dataExist
            });
    } catch (err) {
        return res.status(500).send(err.message);
    }
};

exports.logout = async (req, res) => {    //not working test again later
    try {
        res.redirect("/user/login");
    } catch (err) {
        return res.status(500).send(err.message);
    }
}

// Forgot password api for sub admin verification by email otp
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const customerData = await userModel.findOne({ email: email });
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
        await userModel.findOneAndUpdate(
            { email: email },
            { otp: otp, otpTime: Date.now() }
        );
        return res.status(200).send({ message: "OTP sent to your email", email });
    } catch (err) {
        return res.status(500).send(err.message);
    }
};
// Update password and encrypt it before saving it. if otp is correct and otp is not expired then only update password
exports.updatePassword = async (req, res) => {
    try {
        const { email, otp, password } = req.body;
        const customerData = await userModel.findOne({ email: email });
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
            await userModel.findOneAndUpdate(
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


exports.userUpdate = async (req, res) => {
    try {
if(req.files && req.files.length > 0){
        //const userId = req.body.userId;
        let {
            fullname,
            username,
            email,
            password,
            //avatar,
            gender,
            phoneNumber,
            address,
            story,
            followers,
            following,
            isDeleted
        } = req.body;
        let avatar = req.files;

        const userData = await userModel.findOne({ _id: req.user.userId });
        if (password) {
            const salt = await bcrypt.genSalt(10);
            password = await bcrypt.hash(password, salt);
        }
        // if (userData.isDeleted == true) {
        //     return res.status(400).send({ message: "user is not registered, register first" });
        // }
        //not authorized to update other user data
       // if (userData._id != userId) {
        //     return res.status(400).send({ message: "not authorized to update other user data" });
        // }

        if (avatar && avatar.length > 0) {
            avatar = await aws.uploadFile(avatar[0]);
        }
        else {
            return res.status(400).send({ status: false, message: "profileImage or avatar is required" })
        }

        const updatedData = await userModel.findOneAndUpdate(
            { _id: req.user.userId, isDeleted: false },
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
    } 
    else {
        //const userId = req.body.userId;
        let {
            fullname,
            username,
            email,
            password,
            //avatar,
            gender,
            phoneNumber,
            address,
            story,
            followers,
            following,
            isDeleted
        } = req.body;
       //find user id from jwt token
        const userData = await userModel.findOne({ _id: req.user.userId });
        
        if (password) {
            const salt = await bcrypt.genSalt(10);
            password = await bcrypt.hash(password, salt);
        }
        // if (userData.isDeleted == true) {
        //     return res.status(400).send({ message: "user is not registered, register first" });
        // }
       //user can update their own data only after applying jwt token in header
        // if (userData._id != userId) {
        //     return res.status(400).send({ message: "not authorized to update other user data" });
        // }

        const updatedData = await userModel.findOneAndUpdate(
            { _id: req.user.userId, isDeleted: false },
            {
                fullname: fullname,
                username: username,
                email: email,
                password: password,
                //avatar: avatar,
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
    }
    }
    catch (err) {
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
        return res.status(200).send({ message: "user details", count: userCount, data: user });
    } catch (err) {
        return res.status(500).send(err.message);
    }
}

exports.getByUsername = async (req, res) => {
    try {
        const user = await userModel.findOne({ username: req.body.username })
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
            //const userId = req.user.userId;
            const checkUser = await userModel.find({ _id: req.user.userId, isDeleted: false });
            // if (!checkUser) {
            //     return res.status(400).send({ message: "user not found, or unothorised" });
            // }
        // delete the user only if the user given in body is same as the user in token
        // if (checkUser._id != userId) {
        //     return res.status(400).send({ message: "not authorized to delete other user data" });
        // }

            if (checkUser) {
                const user = await userModel.updateOne({ _id: req.user.userId, isDeleted: false }, { $set: { isDeleted: true, deletedAt: Date.now() } }, { new: true });
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
        const followers = req.user.userId;
        
        const user = await userModel.find({ _id: userId, followers: followers });

        if (user.length > 0)
            return res.status(500).json({ msg: "You followed this user." });

        const newUser = await userModel.findOneAndUpdate(

            { _id: userId },
            { $push: { followers: followers } },
            { new: true }
        ).populate("followers following", "-password");

        await userModel.findOneAndUpdate(
            { _id: followers },
            {
                $push: { following: userId },
            },
            { new: true }
        );

        return res.status(200).send({ msg: "success", data: newUser });
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
}

exports.unfollow = async (req, res) => {
    try {
        const userId = req.params.id;
        const followers = req.user.userId;
        const newUser = await userModel.findOneAndUpdate(
            { _id: userId },
            { $pull: { followers: followers } },
            { new: true }
        ).populate("followers following", "-password");

        await userModel.findOneAndUpdate(
            { _id: followers },
            {
                $pull: { following: userId },
            },
            { new: true }
        );

        return res.status(200).send({ msg: "success", data: newUser });
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
}

exports.suggestionsUser = async (req, res) => {   
    try {

        const newArr = [...req.body.following, req.user.userId/*req.body._id*/]; //body.following means the any one following userid that follows the main user, body.id = main user id

        const num = req.query.num || 10;  // 10 means the no. of suggested user to be shown, you can increase or decrease it

        const users = await userModel.aggregate([
            { $match: { _id: { $nin: newArr } } },
            { $sample: { size: Number(num) } },
            {
                $lookup: {
                    from: "users",
                    localField: "followers",
                    foreignField: "_id",
                    as: "followers",
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "following",
                    foreignField: "_id",
                    as: "following",
                },
            },
        ]).project("-password -saved");

        return res.json({
            result: users.length,
            users
        });
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
}

//_id: req.user.userId

exports.getFollowers = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await userModel.findById(userId).populate("followers following", "-password").select("-password");
        return res.status(200).send({ message: "follower details", data: user });
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
}

exports.getFollowing = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await userModel.findById(userId).populate("following", "-password").select("-password");
        return res.status(200).send({ message: "user details", data: user });
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
}

exports.getFollowersCount = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await userModel.findById(userId).select("followers");
        return res.status(200).send({ message: "followers count", count: user.followers.length });
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
}

exports.getFollowingCount = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await userModel.findById(userId).select("following");
        return res.status(200).send({ message: "following count", count: user.following.length });
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
}

// exports.sharePost = async (req, res) => {             //not working
//     try {
//         const userId = req.body.id;
//         const postId = req.params.id;
//         const user = await userModel.findById(userId);
//         if (!user) return res.status(400).send({ msg: "User does not exist." });
//         const post = await postModel.findById(postId);
//         if (!post) return res.status(400).send({ msg: "Post does not exist." });
//         const newPost = new postModel({
//             userId: userId,
//             desc: post.desc,
//             img: post.img,
//             likes: [],
//             comments: [],
//             shares: [],
//             //shareId: postId,
//         });
//         await newPost.save();
//         return res.status(200).send({ message: "post shared", data: newPost });
//     } catch (err) {
//         return res.status(500).json({ msg: err.message });
//     }
// }

exports.blockUser = async (req, res) => {
    try {
        const userId = req.user.userId;
        const blockId = req.params.id;
        // const user = await userModel.findById(userId);
        const user = await userModel.find({ _id: userId, block: blockId });
        if (user.length > 0)
            return res.status(500).json({ msg: "You already blocked this user." });
        if (!user) return res.status(400).send({ msg: "User does not exist." });
        const block = await userModel.findById(blockId);
        if (!block) return res.status(400).send({ msg: "User does not exist." });
        const blockedUser = await userModel.findOneAndUpdate(
            { _id: userId },
            {
                $push: { block: blockId },
            },
            { new: true }
        );
        return res.status(200).send({ message: "user blocked", data: blockedUser });
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
}

exports.unblockUser = async (req, res) => {
    try {
        const userId = req.user.userId;
        const blockId = req.params.id;
        const user = await userModel.findById(userId);
        if (!user) return res.status(400).send({ msg: "User does not exist." });
        const block = await userModel.findById(blockId);
        if (!block) return res.status(400).send({ msg: "User does not exist." });
        const unblockedUser = await userModel.findOneAndUpdate(
            { _id: userId },
            {
                $pull: { block: blockId },
            },
            { new: true }
        );
        return res.status(200).send({ message: "user unblocked", data : unblockedUser });
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
}
//yha se
exports.getBlockedUsers = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await userModel.findById(userId).populate("block", "-password").select("-password");
        if (user.block.length == 0)
            return res.status(400).send({ msg: "No blocked users." });
        return res.status(200).send({ message: "user details", data: user });
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
}

exports.getBlockedUsersCount = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await userModel.findById(userId).select("block");
        return res.status(200).send({ message: "blocks count", count: user.block.length });
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
}


// exports.getTimeline = async (req, res) => {
//     try {
//         const userId = req.body.id;
//         const user = await userModel.findById(userId);
//         const posts = await postModel.find({ userId: { $in: user.following } }).populate("userId", "-password").sort("-createdAt");
//         return res.status(200).send({ message: "timeline posts", data: posts });
//     } catch (err) {
//         return res.status(500).json({ msg: err.message });
//     }
// }