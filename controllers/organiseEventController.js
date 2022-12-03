//organise events online where nearby people can find and join them
const organiseEventModel = require('../models/organiseEventModel');
const userModel = require('../models/userModel');
const awsForMulti = require('../awsBucket');

exports.createEvent = async (req, res) => {
    try {
        const { name, description, time, address, category } = req.body;
        let images = req.files;

        let date = new Date(req.body.date); //because date was taking 1 day less
        date.setDate(date.getDate() + 1);

        const id = req.user.userId;
        const findUser = await userModel.findById(id);
        if (!findUser) return res.status(400).json({ msg: 'User does not exist.' });

        if (req.files && req.files.length > 0) {
            images = await Promise.all(
                req.files.map(async (file) => {
                    return await awsForMulti.uploadToS3(file.buffer);
                })
            );
        }

        const newEvent = new organiseEventModel({
            name,
            description,
            date,
            time,
            // location: {
            //     coordinates: [parseFloat(req.body.latitude), parseFloat(req.body.longitude)],
            // },
            address,
            category,
            images,
            creator: id
        });
        //if user organises an event, the event will be added to the user's events array
        await newEvent.save();
        await userModel.findByIdAndUpdate(id, { $push: { events: newEvent._id } });

        res.status(201).send({ msg: 'Event created', data: newEvent });
    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
}

//get my all events
exports.getMyEvents = async (req, res) => {
    try {
        const id = req.user.userId;
        const findUser = await userModel.findById(id);
        if (!findUser) return res.status(400).json({ msg: 'User does not exist.' });
        const myEvents = await organiseEventModel.find({ creator: id });
        res.status(200).send({ msg: 'My events', data: myEvents });
    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
}

exports.getMyEventsCount = async (req, res) => {
    try {
        const id = req.user.userId;
        const findUser = await userModel.findById(id);
        if (!findUser) return res.status(400).json({ msg: 'User does not exist.' });
        const myEvents = await organiseEventModel.find({ creator: id });
        res.status(200).send({ msg: 'My events', data: myEvents.length });
    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
}

//get all events by other users
exports.getAllEvents = async (req, res) => {
    try {
        const id = req.user.userId;
        const findUser = await userModel.findById(id);
        if (!findUser) return res.status(400).json({ msg: 'User does not exist.' });
        const events = await organiseEventModel.find({ creator: { $ne: id } });
        res.status(200).send({ msg: 'Events', data: events });
    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
}

exports.getAllEventsCount = async (req, res) => {
    try {
        const id = req.user.userId;
        const findUser = await userModel.findById(id);
        if (!findUser) return res.status(400).json({ msg: 'User does not exist.' });
        const events = await organiseEventModel.find({ creator: { $ne: id } });
        res.status(200).send({ msg: 'Events', data: events.length });
    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
}

//get all events by category
exports.getEventByCategory = async (req, res) => {
    try {
        const id = req.user.userId;
        const findUser = await userModel.findById(id);
        if (!findUser) return res.status(400).json({ msg: 'User does not exist.' });
        const events = await organiseEventModel.find({ category: { $regex: req.query.category, $options: 'i' } });
        res.status(200).send({ msg: 'Events', data: events });
    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
}

//get all events by date
exports.getEventByDate = async (req, res) => {
    try {
        const id = req.user.userId;
        const findUser = await userModel.findById(id);
        if (!findUser) return res.status(400).json({ msg: 'User does not exist.' });
        const events = await organiseEventModel.find({ date: { $gte: req.query.date } });
        res.status(200).send({ msg: 'Events', data: events });
    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
}


//get all events by location
// exports.getEventByLocation = async (req, res) => {
//     try {
//         const id = req.user.userId;
//         const findUser = await userModel.findById(id);
//         if (!findUser) return res.status(400).json({ msg: 'User does not exist.' });
//         const events = await organiseEventModel.find({
//             location: {
//                 $near: {
//                     $geometry: {
//                         type: 'Point',
//                         coordinates: [parseFloat(req.query.longitude), parseFloat(req.query.latitude)],
//                     },
//                     $maxDistance: 10000,
//                 },
//             },
//         });
//         res.status(200).send({ msg: 'Events', data: events });
//     } catch (err) {
//         return res.status(500).send({ msg: err.message });
//     }
// }

//get all events by name    
exports.getEventByName = async (req, res) => {
    try {
        const id = req.user.userId;
        const findUser = await userModel.findById(id);
        if (!findUser) return res.status(400).json({ msg: 'User does not exist.' });
        const events = await organiseEventModel.find({ name: { $regex: req.query.name, $options: 'i' } });
        res.status(200).send({ msg: 'Events', data: events });
    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
}


//get all events by date and category
exports.getEventByDateAndCategory = async (req, res) => {
    try {
        const id = req.user.userId;
        const findUser = await userModel.findById(id);
        if (!findUser) return res.status(400).json({ msg: 'User does not exist.' });
        const events = await organiseEventModel.find({ date: { $gte: req.query.date }, category: { $regex: req.query.category, $options: 'i' } });
        res.status(200).send({ msg: 'Events', data: events });
    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
}



//delete event by creator only
exports.deleteEvent = async (req, res) => {
    try {
        const id = req.user.userId;
        const findUser = await userModel.findById(id);
        if (!findUser) return res.status(400).json({ msg: 'User does not exist.' });
        const findEvent = await organiseEventModel.findById(req.params.id);
        if (!findEvent) return res.status(400).json({ msg: 'Event does not exist.' });
        if (findEvent.creator != id) return res.status(400).json({ msg: 'You are not the creator of this event.' });
        //set isDeleted to true and deleted At to current date
        const deletedEvent = await organiseEventModel.findByIdAndUpdate(req.params.id, { isDeleted: true, deletedAt: Date.now() }, { new: true });
        res.status(200).send({ msg: 'Event deleted', data: deletedEvent });
    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
}

//update event by creator only
exports.updateEvent = async (req, res) => {
    try {
        const id = req.user.userId;
        const findUser = await userModel.findById(id);
        if (!findUser) return res.status(400).json({ msg: 'User does not exist.' });

        const event = await organiseEventModel.findById(req.params.id);
        if (!event) {
            return res.status(400).json({ msg: 'Event does not exist.' });
        }
        if (event.creator != id) return res.status(400).json({ msg: 'You are not, the creator of this event.' });
        //if he is the creator
        if (event.creator == id) {
            if (req.files) {
                let {
                    name,
                    description,
                    category,
                    date,
                    time,
                    //location,
                    address,
                    //creator
                } = req.body;
                let images = req.files
                if (req.files && req.files.length > 0) {
                    images = await Promise.all(
                        req.files.map(async (file) => {
                            return await awsForMulti.uploadToS3(file.buffer);
                        })
                    );
                }
                const updateEvent = await organiseEventModel.findByIdAndUpdate(req.params.id, {
                    name,
                    description,
                    category,
                    date,
                    time,
                    //location,
                    address,
                    //creator,
                    images
                });
                res.status(200).send({ msg: 'Event updated', data: updateEvent });
            }
            else {
                let {
                    name,
                    description,
                    category,
                    date,
                    time,
                    //location,
                    address,
                    //creator
                } = req.body;
                const updateEvent = await organiseEventModel.findByIdAndUpdate(req.params.id, {
                    name,
                    description,
                    category,
                    date,
                    time,
                    //location,
                    address,
                    //creator
                });
                res.status(200).send({ msg: 'Event updated', data: updateEvent });
            }
        }
        // else{
        //     return res.status(400).json({ msg: 'You are not the creator of this event.' });
        // }
    }
    catch (err) {
        return res.status(500).send({ msg: err.message });
    }
}

//join event by other users if already joined then do not join again
exports.joinEvent = async (req, res) => {
    try {
        const id = req.user.userId;
        const findUser = await userModel.findById(id);
        if (!findUser) {
            return res.status(400).json({ msg: 'User does not exist.' });
        }
        const findEvent = await organiseEventModel.findById(req.params.id);
        if (!findEvent) {
            return res.status(400).json({ msg: 'Event does not exist.' });
        }
        if (findEvent.creator == id) {
            return res.status(400).json({ msg: 'You are the creator of this event, you cant join' });
        }
        if (findEvent.participants.includes(id)) {
            return res.status(400).json({ msg: 'You have already joined this event.' });
        }
        const joinedEvent = await organiseEventModel.findByIdAndUpdate(req.params.id, { $push: { participants: id } }, { new: true });
        res.status(200).send({ msg: 'Event joined', data: joinedEvent });
    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
}