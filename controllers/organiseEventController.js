//organise events online where nearby people can find and join them
const organiseEventModel = require('../models/organiseEventModel');
const adminModel = require('../models/adminModel');
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

        return res.status(201).send({ msg: 'Event created', data: newEvent });
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
        return res.status(200).send({ msg: 'My events', data: myEvents });
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
        return res.status(200).send({ msg: 'My events', data: myEvents.length });
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
        return res.status(200).send({ msg: 'Events', data: events });
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
        return res.status(200).send({ msg: 'Events', data: events.length });
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
        return res.status(200).send({ msg: 'Events', data: events });
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
        return res.status(200).send({ msg: 'Events', data: events });
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
        return res.status(200).send({ msg: 'Events', data: events });
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
        return res.status(200).send({ msg: 'Events', data: events });
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
        return res.status(200).send({ msg: 'Event deleted', data: deletedEvent });
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
                return res.status(200).send({ msg: 'Event updated', data: updateEvent });
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
               return res.status(200).send({ msg: 'Event updated', data: updateEvent });
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
        return res.status(200).send({ msg: 'Event joined', data: joinedEvent });
    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
}

//leave event by other users if already left then do not leave again
exports.leaveEvent = async (req, res) => {
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
            return res.status(400).json({ msg: 'You are the creator of this event, you cant leave' });
        }
        if (!findEvent.participants.includes(id)) {
            return res.status(400).json({ msg: 'You have already left this event.' });
        }
        const leftEvent = await organiseEventModel.findByIdAndUpdate(req.params.id, { $pull: { participants: id } }, { new: true });
        return res.status(200).send({ msg: 'Event left', data: leftEvent });
    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
}

//creator can add participants to event
exports.addParticipants = async (req, res) => {
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
        if (findEvent.creator != id) {
            return res.status(400).json({ msg: 'You are not the creator of this event.' });
        }
        const { participants } = req.body;
        const addParticipants = await organiseEventModel.findByIdAndUpdate(req.params.id, { $push: { participants: participants } }, { new: true });
        return res.status(200).send({ msg: 'Participants added', data: addParticipants });
    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
}


//creator can remove participants from event
exports.removeParticipants = async (req, res) => {
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
        if (findEvent.creator != id) {
            return res.status(400).json({ msg: 'You are not the creator of this event.' });
        }
        const { participants } = req.body;
        const removeParticipants = await organiseEventModel.findByIdAndUpdate(req.params.id, { $pull: { participants: participants } }, { new: true });
        return res.status(200).send({ msg: 'Participants removed', data: removeParticipants });
    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
}

//like event by other users if already liked then do not like again
exports.likeEvent = async (req, res) => {
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
        // if (findEvent.creator == id) {
        //     return res.status(400).json({ msg: 'You are the creator of this event, you cant like' });
        // }
        if (findEvent.likes.includes(id)) {
            return res.status(400).json({ msg: 'You have already liked this event.' });
        }
        const likedEvent = await organiseEventModel.findByIdAndUpdate(req.params.id, { $push: { likes: id } }, { new: true });
        return res.status(200).send({ msg: 'Event liked', data: likedEvent });
    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
}

//unlike event by other users if already unliked then do not unlike again
exports.unlikeEvent = async (req, res) => {
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
        // if (findEvent.creator == id) {
        //     return res.status(400).json({ msg: 'You are the creator of this event, you cant unlike' });
        // }
        if (!findEvent.likes.includes(id)) {
            return res.status(400).json({ msg: 'You have already unliked this event.' });
        }
        const unlikedEvent = await organiseEventModel.findByIdAndUpdate(req.params.id, { $pull: { likes: id } }, { new: true });
        return res.status(200).send({ msg: 'Event unliked', data: unlikedEvent });
    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
}

//report event by other users if already reported then do not report again
exports.reportEvent = async (req, res) => {
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
        // if (findEvent.creator == id) {  
        //     return res.status(400).json({ msg: 'You are the creator of this event, you cant report' });
        // }
        if (findEvent.report.includes(id)) {
            return res.status(400).json({ msg: 'You have already reported this event.' });
        }
        //push user id to report array and set isReported to true
        const reportedEvent = await organiseEventModel.findByIdAndUpdate(req.params.id, { $push: { report: id }, isReported: true }, { new: true });
        //const reportedEvent = await organiseEventModel.findByIdAndUpdate(req.params.id, { $push: { report: id } }, { new: true });
        return res.status(200).send({ msg: 'Event reported', data: reportedEvent });
    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
}

//unreport event by other users if already unreported then do not unreport again
exports.unreportEvent = async (req, res) => {
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
        // if (findEvent.creator == id) {
        //     return res.status(400).json({ msg: 'You are the creator of this event, you cant unreport' });
        // }
        if (!findEvent.report.includes(id)) {
            return res.status(400).json({ msg: 'You have already unreported this event.' });
        }
        const unreportedEvent = await organiseEventModel.findByIdAndUpdate(req.params.id, { $pull: { report: id }, isReported: true  }, { new: true });
        return res.status(200).send({ msg: 'Event unreported', data: unreportedEvent });
    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
}


//get joined events by user
exports.getJoinedEvents = async (req, res) => {
    try {
        const id = req.user.userId;
        const findUser = await userModel.findById(id);
        if (!findUser) {
            return res.status(400).json({ msg: 'User does not exist.' });
        }
        const findEvents = await organiseEventModel.find({ participants: id });
        if (!findEvents) {
            return res.status(400).json({ msg: 'No events found.' });
        }
        return res.status(200).send({ msg: 'Events found', data: findEvents });
    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
}

//get joined events count
exports.getJoinedEventsCount = async (req, res) => {
    try {
        const id = req.user.userId;
        const findUser = await userModel.findById(id);
        if (!findUser) {
            return res.status(400).json({ msg: 'User does not exist.' });
        }
        const findEvents = await organiseEventModel.find({ participants: id });
        if (!findEvents) {
            return res.status(400).json({ msg: 'No events found.' });
        }
        return res.status(200).send({ msg: 'Events found', data: findEvents.length });
    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
}

//get reported events by admin
// exports.getReportedEvents = async (req, res) => {
//     try {
//         const id = req.user.userId;
//         const findUser = await userModel.findById(id);
//         if (!findUser) {
//             return res.status(400).json({ msg: 'User does not exist.' });
//         }
//         if (findUser.role != 'admin') {
//             return res.status(400).json({ msg: 'You are not an admin.' });
//         }
//         const findEvents = await organiseEventModel.find({ reports: { $exists: true, $not: { $size: 0 } } });
//         if (!findEvents) {
//             return res.status(400).json({ msg: 'No events found.' });
//         }
//         return res.status(200).send({ msg: 'Events found', data: findEvents }); 
//     } catch (err) {
//         return res.status(500).send({ msg: err.message });
//     }
// }

// //get reported events count by admin
// exports.getReportedEventsCount = async (req, res) => {
//     try {
//         const id = req.user.userId;
//         const findUser = await userModel.findById(id);
//         if (!findUser) {
//             return res.status(400).json({ msg: 'User does not exist.' });
//         }
//         if (findUser.role != 'admin') {
//             return res.status(400).json({ msg: 'You are not an admin.' });
//         }
//         const findEvents = await organiseEventModel.find({ reports: { $exists: true, $not: { $size: 0 } } });
//         if (!findEvents) {
//             return res.status(400).json({ msg: 'No events found.' });
//         }
//         return res.status(200).send({ msg: 'Events found', data: findEvents.length });
//     } catch (err) {
//         return res.status(500).send({ msg: err.message });
//     }
// }