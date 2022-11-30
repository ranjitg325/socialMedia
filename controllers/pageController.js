//create a page like facebook page where a lots of user can post their post in that specific page  and other user can see that post and can like and comment on that post when they follow that page
const userModel = require("../models/userModel");
const pageModel = require("../models/pageModel");
const postModel = require("../models/postModel");
const commentModel = require("../models/commentModel");
//const likeModel = require("../models/likeModel");
//const shareModel = require("../models/shareModel");
//const reportModel = require("../models/reportModel");
//const mongoose = require("mongoose");
const awsForSingle = require('../aws/aws');
const awsForMulti = require('../awsBucket');


//create a page and the user who is creating the page is the admin of that page
exports.createPage = async (req, res) => {
    try {
        if (req.files && req.files.length > 0) {
            let {
                pageName,
                description,
                category,
                location,
                privacy,
            } = req.body;
            let coverImage = req.files;
            const id = req.user.userId;
            const user = await userModel.findById(id);
            if (!user) {
                return res.status(404).json({ message: "user not found" });
            }
            if (coverImage && coverImage.length > 0) {
                coverImage = await awsForSingle.uploadFile(coverImage[0]);
            }
            else {
                return res.status(400).send({ status: false, message: "profileImage or avatar is required" })
            }
            const page = await pageModel.create({
                pageName,
                description,
                category,
                location,
                privacy,
                coverImage,
                admin: id,
            });
            user.pages.push(page._id);
            await user.save();
            
            return res.status(200).send({ settings: { success: "1", message: "Page created successfully" }, data: page });
        }
        else {
            let {
                pageName,
                description,
                category,
                location,
                privacy,
            } = req.body;

            const id = req.user.userId;
            const user = await userModel.findById(id);
            if (!user) {
                return res.status(404).json({ message: "user not found" });
            }

            const page = await pageModel.create({
                pageName,
                description,
                category,
                location,
                privacy,
                admin: id,
            });
            //when page is created the the page id is added to the user db who is creating the page
            user.pages.push(page._id);
            await user.save();  
            return res.status(200).send({ settings: { success: "1", message: "Page created successfully" }, data: page });
        }
    }
    catch (err) {
        return res.status(500).send({ settings: { success: "0", message: err.message } });

    }
}


//add user to page as member and the admin will added automatically when the page is created, give page id in params and user id(who is going to add) in body
exports.addUserToPage = async (req, res) => {
    try {
        const id = req.user.userId;
        const { userId } = req.body;
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "user not found" });
        }
        const page = await pageModel.findById(req.params.id);
        if (!page) {
            return res.status(404).json({ message: "page not found" });
        }
        const isMember = page.members.find((member) => member == userId);
        if (isMember) {
            return res.status(400).json({ message: "user is already a member" });
        }
        if (page.admin == id) {
            page.members.push(userId);
            await page.save();
            return res.status(200).send({ settings: { success: "1", message: "User added successfully" }, data: page });
        }
        else {
            return res.status(400).send({ settings: { success: "0", message: "You are not admin of this page" } });
        }
    }
    catch (err) {
        return res.status(500).send({ settings: { success: "0", message: err.message } });
    }
}
// 

//remove user from page
exports.removeUserFromPage = async (req, res) => {
    try {
        const id = req.user.userId;
        const { userId } = req.body;
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "user not found" });
        }
        const page = await pageModel.findById(req.params.id);
        if (!page) {
            return res.status(404).json({ message: "page not found" });
        }
        const isMember = page.members.find((member) => member == userId);
        if (!isMember) {
            return res.status(400).json({ message: "user is not a member" });
        }
        if (page.admin == id) {
            page.members.pull(userId);
            await page.save();
            return res.status(200).send({ settings: { success: "1", message: "User removed successfully" }, data: page });
        }
        else {
            return res.status(400).send({ settings: { success: "0", message: "You are not admin of this page" } });
        }
    }
    catch (err) {
        return res.status(500).send({ settings: { success: "0", message: err.message } });
    }
}


//get my page by user admin
exports.getMyPages = async (req, res) => {
    try {
        const id = req.user.userId;
        const page = await pageModel.find({ admin: id });
        if (!page) {
            return res.status(404).json({ message: "page not found" });
        }
        if (page.length == 0) {
            return res.status(200).send({ settings: { success: "1", message: "You have no page created" } });
        }
        return res.status(200).send({ settings: { success: "1", message: "Page found successfully" }, data: page });
    }
    catch (err) {
        return res.status(500).send({ settings: { success: "0", message: err.message } });
    }
}

//get all pages by admin
exports.getAllPages = async (req, res) => {
    try {
        const page = await pageModel.find();
        if (!page) {
            return res.status(404).json({ message: "page not found" });
        }
        if (page.length == 0) {
            return res.status(200).send({ settings: { success: "1", message: "No page found" } });
        }
        return res.status(200).send({ settings: { success: "1", message: "Page found successfully" }, data: page });
    }
    catch (err) {
        return res.status(500).send({ settings: { success: "0", message: err.message } });
    }
}


//update page by user admin and give page id in params and data in body, if any user update anything accept the coverImage, then the coverImage will be not affected
exports.updatePage = async (req, res) => {
    try {
        const id = req.user.userId;
        const page = await pageModel.findById(req.params.id);
        if (!page) {
            return res.status(404).json({ message: "page not found" });
        }
        if (page.admin == id) {
            if (req.files) {
                let {
                    pageName,
                    description,
                    category,
                    location,
                    privacy,
                } = req.body;
                let coverImage = req.files;
                if (coverImage && coverImage.length > 0) {
                    coverImage = await awsForSingle.uploadFile(coverImage[0]);
                }
                else {
                    return res.status(400).send({ status: false, message: "cover image is required" })
                }
                page.pageName = pageName;
                page.description = description;
                page.category = category;
                page.location = location;
                page.privacy = privacy;
                page.coverImage = coverImage;
                await page.save();
                return res.status(200).send({ settings: { success: "1", message: "Page updated successfully" }, data: page });
            }
            else {
                let {
                    pageName,
                    description,
                    category,
                    location,
                    privacy,
                } = req.body;
                page.pageName = pageName;
                page.description = description;
                page.category = category;
                page.location = location;
                page.privacy = privacy;
                await page.save();
                return res.status(200).send({ settings: { success: "1", message: "Page updated successfully" }, data: page });
            }
        }
        else {
            return res.status(400).send({ settings: { success: "0", message: "You are not admin of this page" } });
        }
    }
    catch (err) {
        return res.status(500).send({ settings: { success: "0", message: err.message } });
    }

}

//delete page by admin only
exports.deletePage = async (req, res) => {
    try {
        const id = req.user.userId;
        const page = await pageModel.findById(req.params.id);
        //if page is already deleted
        if (page.isDeleted == true) {
            return res.status(400).send({ settings: { success: "0", message: "Page is already deleted" } });
        }
        //when admin delete page all the members of that page will be removed and all posts of that page will be deleted and on page set isDeleted to true
        if (page.admin == id) {
            // page.isDeleted = true, deletedAt = Date.now();
            //set isDeleted to true and deletedAt to Date.now() with new: true
            const deletedPage = await pageModel.findByIdAndUpdate(req.params.id, { isDeleted: true, deletedAt: Date.now() }, { new: true });
            if (!deletedPage) {
                return res.status(404).json({ message: "page not found" });
            }
            return res.status(200).send({ settings: { success: "1", message: "Page deleted successfully" }, data: deletedPage });
        }
        else {
            return res.status(400).send({ settings: { success: "0", message: "You are not admin of this page" } });
        }
    }
    catch (err) {
        return res.status(500).send({ settings: { success: "0", message: err.message } });
    }
}

//get page by id
// exports.getPageById = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const page = await pageModel.findById(id);
//         if (!page) {
//             return res.status(404).send({ settings: { success: "0", message: "Page not found" } });
//         }
//         return res.status(200).send({ settings: { success: "1", message: "Page found successfully" }, data: page });
//     } catch (err) {
//         return res.status(500).send({ settings: { success: "0", message: err.message } });
//     }
// }

//search page by category by any user using regex
exports.searchPageByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const page = await pageModel.find({ category: { $regex: category, $options: "i" } });
        if (!page) {
            return res.status(404).send({ settings: { success: "0", message: "Page not found" } });
        }
        return res.status(200).send({ settings: { success: "1", message: "Page found successfully" }, data: page });
    } catch (err) {
        return res.status(500).send({ settings: { success: "0", message: err.message } });
    }
}
//search a page by name by any user
exports.searchPageByName = async (req, res) => {
    try {
        const page = await pageModel.find({ pageName: { $regex: req.params.name, $options: "i" } });
        if (!page) {
            return res.status(404).json({ message: "page not found" });
        }
        if (page.length == 0) {
            return res.status(200).send({ settings: { success: "1", message: "No page found" } });
        }
        return res.status(200).send({ settings: { success: "1", message: "Page found successfully" }, data: page });
    }
    catch (err) {
        return res.status(500).send({ settings: { success: "0", message: err.message } });
    }
}

//get all users in a page
exports.getAllUsersInPage = async (req, res) => {
    try {
        const page = await pageModel.findById(req.params.id);
        if (!page) {
            return res.status(404).json({ message: "page not found" });
        }
        const users = await userModel.find({ _id: { $in: page.members } });
        if (!users) {
            return res.status(404).json({ message: "users not found" });
        }
        return res.status(200).send({ settings: { success: "1", message: "Users found successfully" }, data: users });
    }
    catch (err) {
        return res.status(500).send({ settings: { success: "0", message: err.message } });
    }
}

//get all posts in page by anyone, the page id is stored in all posts of that page
exports.getAllPostsOfPage = async (req, res) => {
    try {
        const page = await pageModel.findById(req.params.id);
        if (!page) {
            return res.status(404).json({ message: "page not found" });
        }
        const posts = await postModel.find({ page: page._id });
        if (!posts) {
            return res.status(404).json({ message: "posts not found" });
        }
        return res.status(200).send({ settings: { success: "1", message: "Posts found successfully" }, data: posts });
    }
    catch (err) {
        return res.status(500).send({ settings: { success: "0", message: err.message } });
    }
}

//join page by other users in members array but if group is private then request will be sent to admin
exports.joinPage = async (req, res) => {
    try {
        const id = req.user.userId;
        const page = await pageModel.findById(req.params.id);
        if (!page) {
            return res.status(404).json({ message: "page not found" });
        }
        //if user is already in members array
        if (page.members.includes(id)) {
            return res.status(400).send({ settings: { success: "0", message: "You are already in this page" } });
        }
        //admin can't join page
        if (page.admin == id) {
            return res.status(400).send({ settings: { success: "0", message: "You are admin of this page" } });
        }

        if (page.privacy == "public") {
            page.members.push(id);
            await page.save();
            return res.status(200).send({ settings: { success: "1", message: "Page joined successfully" }, data: page });
        }
        else {
            page.requests.push(id);
            await page.save();
            return res.status(200).send({ settings: { success: "1", message: "Request sent to admin" }, data: page });
        }
    }
    catch (err) {
        return res.status(500).send({ settings: { success: "0", message: err.message } });
    }
}
//accept request to join page done by admin only and request will be removed from requests array and added to members array and admin will decide to whom he want to add by giving id of user in body
exports.acceptRequestToJoinPage = async (req, res) => {
    try {
        const id = req.user.userId;
        const page = await pageModel.findById(req.params.id);
        if (!page) {
            return res.status(404).json({ message: "page not found" });
        }
        //if user is already in members array
        if (page.members.includes(req.body.userId)) {
            return res.status(400).send({ settings: { success: "0", message: "User is already in this page" } });
        }
        //user can't accept request to join page
        if (page.admin != id) {
            return res.status(400).send({ settings: { success: "0", message: "You are not admin of this page" } });
        }
        //if user is already in requests array
        if (!page.requests.includes(req.body.userId)) {
            return res.status(400).send({ settings: { success: "0", message: "User has not requested to join this page" } });
        }
        page.members.push(req.body.userId);
        page.requests = page.requests.filter((user) => user != req.body.userId);
        await page.save();
        return res.status(200).send({ settings: { success: "1", message: "User added to page successfully" }, data: page });
    }
    catch (err) {
        return res.status(500).send({ settings: { success: "0", message: err.message } });
    }
}
//leave page by other users in members array
exports.leavePage = async (req, res) => {
    try {
        const id = req.user.userId;
        const page = await pageModel.findById(req.params.id);
        if (!page) {
            return res.status(404).json({ message: "page not found" });
        }
        //if user is not in members array
        if (!page.members.includes(id)) {
            return res.status(400).send({ settings: { success: "0", message: "You are not in this page" } });
        }
        //admin can't leave page
        if (page.admin == id) {
            return res.status(400).send({ settings: { success: "0", message: "You are admin of this page" } });
        }
        page.members = page.members.filter((user) => user != id);
        await page.save();
        return res.status(200).send({ settings: { success: "1", message: "Page left successfully" }, data: page });
    }
    catch (err) {
        return res.status(500).send({ settings: { success: "0", message: err.message } });
    }
}

//post in page by other users and admin
exports.postInsidePage = async (req, res) => {
    try {
        const id = req.user.userId;
        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).send({ settings: { success: "0", message: "User not found" } });
        }
        const { content } = req.body;
        let images = req.files;

        //page id will be in params
        const pageId = req.params.id;
        const page = await pageModel.findById(req.params.id);
        if (!page) {
            return res.status(404).send({ settings: { success: "0", message: "Page not found" } });
        }
        //if either content or images are not provided
        if (!content && !images) {
            return res.status(400).send({ settings: { success: "0", message: "Content or images are required" } });
        }
        if (req.files && req.files.length > 0) {
            images = await Promise.all(
                req.files.map(async (file) => {
                    return await awsForMulti.uploadToS3(file.buffer);
                })
            );
        }
        //only admin and members can post in page
        if (!page.members.includes(id) && page.admin != id) {
            return res.status(400).send({ settings: { success: "0", message: "You are not a member" } });
        }
        // if (!page.members.includes(id)) {
        //     return res.status(400).send({ settings: { success: "0", message: "You are not a member" } });
        // }
        const post = new postModel({
            content,
            images,
            user: id,
            page: pageId
        });
        //when post is created it will be added to posts array of page
        page.posts.push(post._id);
        await page.save();
        await post.save();
        return res.status(200).send({ settings: { success: "1", message: "Post created successfully" }, data: post });
    } catch (err) {
        return res.status(500).send({ settings: { success: "0", message: err.message } });
    }
}

//delete post form page by admin and user who created post, where page id will be in params and post id will be in body
exports.deletePostFromPage = async (req, res) => {
    try {
        const id = req.user.userId;
        const post = await postModel.findById(req.body.postId);
        if (!post) {
            return res.status(404).send({ settings: { success: "0", message: "Post not found" } });
        }
        if (post.isDeleted == true) {
            return res.status(404).send({ settings: { success: "0", message: "Post not found." } });
        }
        const page = await pageModel.findById(req.params.id);
        if (!page) {
            return res.status(404).send({ settings: { success: "0", message: "Page not found" } });
        }
        //only admin and user who created post can delete post
        if (post.user != id && page.admin != id) {
            return res.status(400).send({ settings: { success: "0", message: "You are not allowed to delete this post" } });
        }
        //set isDeleted to true and deleted at to current time
        post.isDeleted = true;
        post.deletedAt = Date.now();
        await post.save();
        return res.status(200).send({ settings: { success: "1", message: "Post deleted successfully" }, data: post });
    } catch (err) {
        return res.status(500).send({ settings: { success: "0", message: err.message } });
    }
}

//update post of page by user and give page id in params and data in body, if any user update anything accept the images, then the images will be not affected
exports.updatePostOfPage = async (req, res) => {
    try {
        const id = req.user.userId;
        const post = await postModel.findById(req.body.postId);
        if (!post) {
            return res.status(404).send({ settings: { success: "0", message: "Post not found" } });
        }
        if (post.isDeleted == true) {
            return res.status(404).send({ settings: { success: "0", message: "Post not found." } });
        }
        const page = await pageModel.findById(req.params.id);
        if (!page) {
            return res.status(404).send({ settings: { success: "0", message: "Page not found" } });
        }
        //only user who created post can update post
        if (post.user == id) {
            if (req.files) {
                let {
                    content,
                    //images
                } = req.body;
                let images = req.files;
                if (req.files && req.files.length > 0) {
                    images = await Promise.all(
                        req.files.map(async (file) => {
                            return await awsForMulti.uploadToS3(file.buffer);
                        })
                    );
                }
                post.content = content;
                post.images = images;
                await post.save();
                return res.status(200).send({ settings: { success: "1", message: "Post updated successfully" }, data: post });

            }
            else {
                let {
                    content,
                    //images
                } = req.body;
                post.content = content;
                await post.save();
                return res.status(200).send({ settings: { success: "1", message: "Post updated successfully" }, data: post });

            }
        }
        else {
            return res.status(400).send({ settings: { success: "0", message: "You are not allowed to update this post" } });
        }
    } catch (err) {
        return res.status(500).send({ settings: { success: "0", message: err.message } });
    }
}

//like post in page by other users and admin
exports.likePostOfPage = async (req, res) => {
    try {
        const id = req.user.userId;
        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).send({ settings: { success: "0", message: "User not found" } });
        }
        const post = await postModel.findById(req.body.postId);
        if (!post) {
            return res.status(404).send({ settings: { success: "0", message: "Post not found" } });
        }
        if (post.isDeleted == true) {
            return res.status(404).send({ settings: { success: "0", message: "Post not found." } });
        }
        const page = await pageModel.findById(req.params.id);
        if (!page) {
            return res.status(404).send({ settings: { success: "0", message: "Page not found" } });
        }
        //any user can like post
        if (post.likes.includes(id)) {
            return res.status(400).send({ settings: { success: "0", message: "You already liked this post" } });
        }
        post.likes.push(id);
        await post.save();
        return res.status(200).send({ settings: { success: "1", message: "Post liked successfully" }, data: post });
    } catch (err) {
        return res.status(500).send({ settings: { success: "0", message: err.message } });
    }
}

//unlike post in page by other users and admin
exports.unLikePostOfPage = async (req, res) => {
    try {
        const id = req.user.userId;
        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).send({ settings: { success: "0", message: "User not found" } });
        }
        const post = await postModel.findById(req.body.postId);
        if (!post) {
            return res.status(404).send({ settings: { success: "0", message: "Post not found" } });
        }
        if (post.isDeleted == true) {
            return res.status(404).send({ settings: { success: "0", message: "Post not found." } });
        }
        const page = await pageModel.findById(req.params.id);
        if (!page) {
            return res.status(404).send({ settings: { success: "0", message: "Page not found" } });
        }
        //any user can unlike post
        if (!post.likes.includes(id)) {
            return res.status(400).send({ settings: { success: "0", message: "You already unliked this post" } });
        }
        post.likes.pull(id);
        await post.save();
        return res.status(200).send({ settings: { success: "1", message: "Post unliked successfully" }, data: post });
    } catch (err) {
        return res.status(500).send({ settings: { success: "0", message: err.message } });
    }
}

//like page by other users and admin
exports.likePage = async (req, res) => {
    try {
        const id = req.user.userId;
        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).send({ settings: { success: "0", message: "User not found" } });
        }
        const page = await pageModel.findById(req.params.id);
        if (!page) {
            return res.status(404).send({ settings: { success: "0", message: "Page not found" } });
        }
        //any user can like page
        if (page.likes.includes(id)) {
            return res.status(400).send({ settings: { success: "0", message: "You already liked this page" } });
        }
        page.likes.push(id);
        await page.save();
        return res.status(200).send({ settings: { success: "1", message: "Page liked successfully" }, data: page });
    } catch (err) {
        return res.status(500).send({ settings: { success: "0", message: err.message } });
    }
}

//unlike page by other users and admin
exports.unLikePage = async (req, res) => {
    try {
        const id = req.user.userId;
        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).send({ settings: { success: "0", message: "User not found" } });
        }
        const page = await pageModel.findById(req.params.id);
        if (!page) {
            return res.status(404).send({ settings: { success: "0", message: "Page not found" } });
        }
        //any user can unlike page
        if (!page.likes.includes(id)) {
            return res.status(400).send({ settings: { success: "0", message: "You already unliked this page" } });
        }
        page.likes.pull(id);
        await page.save();
        return res.status(200).send({ settings: { success: "1", message: "Page unliked successfully" }, data: page });
    } catch (err) {
        return res.status(500).send({ settings: { success: "0", message: err.message } });
    }
}

//report page by other users 
exports.reportPage = async (req, res) => {
    try {
        const id = req.user.userId;
        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).send({ settings: { success: "0", message: "User not found" } });
        }   
        const page = await pageModel.findById(req.params.id);
        if (!page) {
            return res.status(404).send({ settings: { success: "0", message: "Page not found" } });
        }
        //any user can report page
        if (page.report.includes(id)) {
            return res.status(400).send({ settings: { success: "0", message: "You already reported this page" } });
        }
        page.report.push(id);
        page.isReported = true;
        await page.save();
        return res.status(200).send({ settings: { success: "1", message: "Page reported successfully" }, data: page });
    } catch (err) {
        return res.status(500).send({ settings: { success: "0", message: err.message } });
    }
}

//unreport page by other users
exports.unReportPage = async (req, res) => {
    try {
        const id = req.user.userId;
        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).send({ settings: { success: "0", message: "User not found" } });
        }
        const page = await pageModel.findById(req.params.id);
        if (!page) {
            return res.status(404).send({ settings: { success: "0", message: "Page not found" } });
        }
        //any user can unreport page
        if (!page.report.includes(id)) {
            return res.status(400).send({ settings: { success: "0", message: "You already unreported this page" } });
        }
        page.report.pull(id);
        page.isReported = false;
        await page.save();
        return res.status(200).send({ settings: { success: "1", message: "Page unreported successfully" }, data: page });
    } catch (err) {
        return res.status(500).send({ settings: { success: "0", message: err.message } });
    }
}

//share page to other users
// exports.sharePage = async (req, res) => {
//     try {
//         const id = req.user.userId;
//         const user = await userModel.findById(id);
//         if (!user) {
//             return res.status(404).send({ settings: { success: "0", message: "User not found" } });
//         }
//         const page = await pageModel.findById(req.params.id);
//         if (!page) {
//             return res.status(404).send({ settings: { success: "0", message: "Page not found" } });
//         }
//         //any user can share page
//         if (page.shares.includes(id)) {
//             return res.status(400).send({ settings: { success: "0", message: "You already shared this page" } });
//         }
//         page.shares.push(id);
//         await page.save();
//         return res.status(200).send({ settings: { success: "1", message: "Page shared successfully" }, data: page });
//     } catch (err) {
//         return res.status(500).send({ settings: { success: "0", message: err.message } });
//     }
// }