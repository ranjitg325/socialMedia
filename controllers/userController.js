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
            return res.status(201).send({ status: true, data: userData });
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
            return res.status(201).send({ status: true, data: userData });
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
//for now this login is disabled for testing only, in production remove the another login code and use this
// exports.login = async (req, res) => {
//     try {
//         const userEmail = req.body.email;
//         const userOtp = req.body.otp;

//         const dataExist = await userModel.findOne({ email: userEmail }).populate(
//             "followers following",
//             "avatar username fullname followers following"
//         ).select("-password");

//         if (!dataExist)
//             return res.status(404).send({ message: "user dose not exist" });
//         const { _id, fullname } = dataExist;
//         const validOtp = await bcrypt.compare(userOtp, dataExist.mail_otp);
//         if (!validOtp) return res.status(400).send({ message: "Invalid OTP" });
//         const payload = { userId: _id, email: userEmail };
//         const generatedToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, /*{  expiresIn: "10080m",}*/); //in final code push remove the comment expires in time
//         res.header("jwt-token", generatedToken);
//         return res
//             .status(200)
//             .send({
//                 message: `${fullname} you are logged in Successfully`,
//                 Token: generatedToken,
//                 userDetails: dataExist
//             });
//     } catch (err) {
//         return res.status(500).send(err.message);
//     }
// };

//login using password
exports.login = async (req, res) => {
    //exports.subAdmin_login = async (req, res) => {
    try {
        const subAdminEmail = req.body.email;
        const subAdminPassword = req.body.password;
        let subAdmin = await userModel.findOne({ email: subAdminEmail }).populate("following");
        if (!subAdmin) {
            return res
                .status(400)
                .send({ message: "email is not valid or user dose not exist" });
        }
        const { _id, password } = subAdmin;
        const validPassword = await bcrypt.compare(subAdminPassword, password);
        if (!validPassword) {
            return res.status(400).send({ message: "Invalid Password" });
        }
        const payload = { userId: _id, email: subAdminEmail, following: subAdmin.following };
        const generatedToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, {      // "" + added here
            expiresIn: "10080m",
        });
        res.header("jwt-token", generatedToken);
        return res
            .status(200)
            .send({
                message: ` you have logged in Successfully`,
                token: generatedToken
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
        if (req.files && req.files.length > 0) {
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
        const userCount = await userModel.find({ username: { $regex: req.query.username } }).count();
        const user = await userModel.find({ username: { $regex: req.query.username } }).select("avatar username");
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
        const user = await userModel.findOne({ username: req.query.username })
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

        const newArr = [...req.user.following, req.user.userId]; //for req.user.following, you have to pass following keyword in payload while loging in in login controller, otherwise it will not work

        const num = req.query.num || 10;  // 10 means the no. of suggested user to be shown, you can increase or decrease it

        const users = await userModel.aggregate([
            { $match: { _id: { $nin: newArr }, isDeleted: false } },
            { $sample: { size: Number(num) } },
            {
                $lookup: {
                    from: "users",
                    localField: "followers",
                    foreignField: "_id",
                    as: "followers",
                },
            },
            //isDeleted: false
            {
                $lookup: {
                    from: "users",
                    localField: "following",
                    foreignField: "_id",
                    as: "following",
                },
            },
            {
                $project: {
                    password: 0,    
                    isDeleted: 0,
                    deletedAt: 0,
                    updatedAt: 0,
                   createdAt: 0,
                   saved : 0,
                    __v: 0,
                },
            },
        ]);

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
        return res.status(200).send({ message: "user unblocked", data: unblockedUser });
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

//send friend request to another user who is not in your friend list and keep the sent request in your sent request list
exports.sendFriendRequest = async (req, res) => {
    try {
        const userId = req.user.userId;
        const receiverId = req.params.id;
        const user = await userModel.findById(userId);
        if (!user) return res.status(400).send({ msg: "User does not exist." });
        const receiver = await userModel.findById(receiverId);
        if (!receiver) return res.status(400).send({ msg: "other User does not exist." });
        const friend = await userModel.find({ _id: userId, friends: receiverId });
        if (friend.length > 0)
            return res.status(500).json({ msg: "You are already friends." });
        const sentRequest = await userModel.find({ _id: userId, sentRequest: receiverId });
        if (sentRequest.length > 0)
            return res.status(500).json({ msg: "You already sent a friend request to this user." });
        const newFriendRequest = await userModel.findOneAndUpdate({ _id: userId }, { $push: { sentRequest: receiverId } }, { new: true });
        const newReceivedRequest = await userModel.findOneAndUpdate({ _id: receiverId }, { $push: { friendRequest: userId } }, { new: true });
        return res.status(200).send({ message: "friend request sent", data: newFriendRequest });
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
}


//accept friend request from another user who is in your friend request list and keep the friend in your friend list and remove the sent request from your sent request list
exports.acceptFriendRequest = async (req, res) => {
    try {
        const userId = req.user.userId;
        const senderId = req.params.id;
        const user = await userModel.findById(userId);
        if (!user) return res.status(400).send({ msg: "User does not exist." });
        const sender = await userModel.findById(senderId);
        if (!sender) return res.status(400).send({ msg: "other User does not exist." });
        const friend = await userModel.find({ _id: userId, friends: senderId });
        if (friend.length > 0)
            return res.status(500).json({ msg: "You are already friends." });
        const receivedRequest = await userModel.find({ _id: userId, friendRequest: senderId });
        if (receivedRequest.length == 0)
            return res.status(500).json({ msg: "You have not received a friend request from this user." });
        const newFriend = await userModel.findOneAndUpdate({ _id: userId }, { $push: { friends: senderId }, $pull: { sentRequest: senderId, friendRequest: senderId } }, { new: true });
        const newFriend2 = await userModel.findOneAndUpdate({ _id: senderId }, { $push: { friends: userId }, $pull: { sentRequest: userId, friendRequest: userId } }, { new: true });
        return res.status(200).send({ message: "friend request accepted", data: newFriend });
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
}

//cancel friend request to another user who is in your sent request list and remove the sent request from your sent request list
exports.cancelFriendRequest = async (req, res) => {
    try {
        const userId = req.user.userId;
        const receiverId = req.params.id;
        const user = await userModel.findById(userId);
        if (!user) return res.status(400).send({ msg: "User does not exist." });
        const receiver = await userModel.findById(receiverId);
        if (!receiver) return res.status(400).send({ msg: "other User does not exist." });
        const friend = await userModel.find({ _id: userId, friends: receiverId });
        if (friend.length > 0)
            return res.status(500).json({ msg: "You are already friends." });
        // const sentRequest = await userModel.find({ _id : userId, sentRequest: receiverId });
        // if (sentRequest.length == 0)
        //     return res.status(500).json({ msg: "You have not sent a friend request to this user." });
        const newFriendRequest = await userModel.findOneAndUpdate({ _id: userId }, { $pull: { friendRequest: receiverId } }, { new: true });
        //const newReceivedRequest = await userModel.findOneAndUpdate ( { _id: receiverId }, { $pull: { sentRequest : userId } }, { new: true } );  //this is dependable, so according to the situation, you can use it or not
        return res.status(200).send({ message: "friend request cancelled", data: newFriendRequest });
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
}

//unfriend
exports.unfriend = async (req, res) => {
    try {
        const userId = req.user.userId;
        const friendId = req.params.id;
        const user = await userModel.findById(userId);
        if (!user) return res.status(400).send({ msg: "User does not exist." });
        const friend = await userModel.findById(friendId);
        if (!friend) return res.status(400).send({ msg: "other User does not exist." });
        const friend2 = await userModel.find({ _id: userId, friends: friendId });
        if (friend2.length == 0)
            return res.status(500).json({ msg: "You are not friends." });
        const newFriend = await userModel.findOneAndUpdate({ _id: userId }, { $pull: { friends: friendId } }, { new: true });
        const newFriend2 = await userModel.findOneAndUpdate({ _id: friendId }, { $pull: { friends: userId } }, { new: true });
        return res.status(200).send({ message: "unfriended", data: newFriend });
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
}

//get friend requests
exports.getFriendRequests = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await userModel.findById(userId);
        if (!user) return res.status(400).send({ msg: "User does not exist." });
        const friendRequests = await userModel.findById(userId).populate('friendRequest');
        //if no friend requests
        if (friendRequests.friendRequest.length == 0)
            return res.status(500).json({ msg: "You have no friend requests." });
        return res.status(200).send({ message: "friend requests", data: friendRequests.friendRequest });
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
}



//get my friends list
exports.getFriends = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await userModel.findById(userId).populate("friends", "-password").select("-password");
        if (user.friends.length == 0)
            return res.status(400).send({ msg: "No friends." });
        return res.status(200).send({ message: "friends", data: user });
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
}

//get friends count
exports.getFriendsCount = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await userModel.findById(userId);
        if (!user) return res.status(400).send({ msg: "User does not exist." });
        const friendsCount = await userModel.findById(userId).populate('friends');
        return res.status(200).send({ message: "friends count", data: friendsCount.friends.length });
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
}

//get friend requests count sent to me
exports.getFriendRequestsCount = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await userModel.findById(userId);
        if (!user) return res.status(400).send({ msg: "User does not exist." });
        const friendRequestsCount = await userModel.findById(userId).populate('friendRequest');
        return res.status(200).send({ message: "friend requests count", data: friendRequestsCount.friendRequest.length });
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
}
// not required
//get all users
// exports.getAllUsers = async (req, res) => {
//     try {
//         const userId = req.user.userId;
//         const user = await userModel.findById(userId ).select("friends");
//         const users = await userModel.find({ _id: { $nin: user.friends } }).select("-password");
//         return res.status(200).send({ message: "all users", data: users });
//     } catch (err) {
//         return res.status(500).json({ msg: err.message });
//     }
// }

// //get all users count
// exports.getAllUsersCount = async (req, res) => {
//     try {
//         const userId = req.user.userId;
//         const user = await userModel.findById(userId ).select("friends");
//         const users = await userModel.find({ _id: { $nin: user.friends } }).select("-password");
//         return res.status(200).send({ message: "all users count", count: users.length });
//     } catch (err) {
//         return res.status(500).json({ msg: err.message });
//     }
// }
//yha tk not required uper dekho

//reject friend request
// exports.rejectFriendRequest = async (req, res) => {
//     try {
//         const userId = req.user.userId;
//         const senderId = req.params.id;
//         const user = await userModel.findById(userId);
//         if (!user) return res.status(400).send({ msg: "User does not exist." });
//         const sender = await userModel.findById( senderId );
//         if (!sender) return res.status(400).send({ msg: "other User does not exist." });
//         const sender2 = await userModel.find({ _id: userId, friendRequest: senderId });
//         if (sender2.length == 0)
//             return res.status(500).json({ msg: "You have not received any friend request from this user." });
//         const newSender = await userModel.findOneAndUpdate ( { _id: userId }, { $pull: { friendRequest : senderId } }, { new: true } );
//         const newSender2 = await userModel.findOneAndUpdate ( { _id: senderId }, { $pull: { sentRequest : userId } }, { new: true } );
//         return res.status(200).send({ message: "friend request rejected", data: newSender });
//     } catch (err) {
//         return res.status(500).json({ msg: err.message });
//     }
// }

//if friend request is rejected then remove friend request from sender
// exports.removeFriendRequest = async (req, res) => {
//     try {
//         const userId = req.user.userId;
//         const friendId = req.params.id;
//         const user = await userModel.findOne({ _id: userId, friendRequest: friendId });
//         if (!user) return res.status(400).send({ msg: "User does not exist." });
//         const friend = await userModel.findById( friendId );
//         if (!friend) return res.status(400).send({ msg: "User does not exist." });
//         const friendRequests = await userModel.findOneAndUpdate ( { _id: friendId }, { $pull: { friendRequest: userId } }, { new: true } );
//         return res.status(200).send({ message: "friend request removed", data: friendRequests });
//     } catch (err) {
//         return res.status(500).json({ msg: err.message });
//     }
// }

// get sent friend requests
exports.getSentFriendRequests = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await userModel.findById(userId).select("sentRequest");
        const sentRequests = await userModel.find({ _id: { $in: user.sentRequest } }).select("-password");
        //if no sent requests
        if (sentRequests.length == 0)
            return res.status(400).send({ msg: "No sent requests." });
        return res.status(200).send({ message: "sent friend requests", data: sentRequests });
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
}

//get sent friend requests count
exports.getSentFriendRequestsCount = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await userModel.findById(userId).select("sentRequest");
        const sentRequests = await userModel.find({ _id: { $in: user.sentRequest } }).select("-password");
        return res.status(200).send({ message: "sent friend requests count", count: sentRequests.length });
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
}

//get mutual friends
exports.getMutualFriends = async (req, res) => {
    try {
        const userId = req.user.userId;
        const friendId = req.params.id;
        const user = await userModel.findById(userId).select("friends");
        const friend = await userModel.findById(friendId).select("friends");
        const mutualFriends = await userModel.find({ _id: { $in: user.friends, $in: friend.friends } }).select("-password");
        //if no mutual friends
        if (mutualFriends.length == 0)
            return res.status(400).send({ msg: "No mutual friends." });
        return res.status(200).send({ message: "mutual friends", data: mutualFriends });
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
}
// exports.getMutualFriends = async (req, res) => {
//     try {
//         const userId = req.user.userId;
//         const user = await userModel.findById(userId ).select("friends");
//         const friends = await userModel.find({ _id: { $in: user.friends } }).select("friends");
//         const mutualFriends = [];
//         for (let i = 0; i < friends.length; i++) {
//             for (let j = 0; j < friends[i].friends.length; j++) {
//                 if (friends[i].friends[j] != userId) {
//                     mutualFriends.push(friends[i].friends[j]);
//                 }
//             }
//         }
//         const mutualFriends2 = await userModel.find({ _id: { $in: mutualFriends } }).select("-password");
//         //if no mutual friends
//         if (mutualFriends2.length == 0)
//             return res.status(400).send({ msg: "No mutual friends." });
//         return res.status(200).send({ message: "mutual friends", data: mutualFriends2 });
//     } catch (err) {
//         return res.status(500).json({ msg: err.message });
//     }
// }
//get mutual friends count
exports.getMutualFriendsCount = async (req, res) => {
    try {
        const userId = req.user.userId;
        const friendId = req.params.id;
        const user = await userModel.findById(userId).select("friends");
        const friend = await userModel.findById(friendId).select("friends");
        const mutualFriends = await userModel.find({ _id: { $in: user.friends, $in: friend.friends } }).select("-password");
        return res.status(200).send({ message: "mutual friends count", count: mutualFriends.length });
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
}

//pull friend request which is send by user
exports.pullFriendRequest = async (req, res) => {
    try {
        const userId = req.user.userId;
        const friendId = req.params.id;
        const user = await userModel.findById(userId);
        if (!user) return res.status(400).send({ msg: "User does not exist." });
        const friend = await userModel.findById(friendId);
        if (!friend) return res.status(400).send({ msg: "User does not exist." });
        const friendRequests = await userModel.findOneAndUpdate({ _id: userId }, { $pull: { sentRequest: friendId } }, { new: true });
        const friendRequests2 = await userModel.findOneAndUpdate({ _id: friendId }, { $pull: { friendRequest: userId } }, { new: true });
        return res.status(200).send({ message: "friend request removed", data: friendRequests });
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
}


