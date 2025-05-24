import Task from '../models/Task.js';
import User from '../models/userModel.js';
import Location from '../models/Location.js';
import { successResponse, errorResponse } from '../views/responseTemplates.js';

// 📌 Fetch Nearby Tasks
export const getNearbyTasks = async (req, res) => {
    try {
        let { lat, lng, radius } = req.query;
        if (!lat || !lng || !radius) {
            return errorResponse(res, 'Latitude, longitude, and radius are required', 400);
        }

        lat = parseFloat(lat);
        lng = parseFloat(lng);
        radius = parseFloat(radius) * 1000; // Convert km to meters

        // Ensure the index exists before querying
        await Task.createIndexes({ location: '2dsphere' });

        const tasks = await Task.find({
            location: {
                $near: {
                    $geometry: { type: 'Point', coordinates: [lng, lat] },
                    $maxDistance: radius
                }
            }
        });

        return successResponse(res, 'Nearby tasks fetched successfully', 200, tasks);
    } catch (error) {
        console.error("Error fetching nearby tasks:", error);
        return errorResponse(res, error.message || 'Server error', 500);
    }
};

// 📌 Update User Location
export const updateUserLocation = async (req, res) => {
    try {
        const { lat, lng } = req.body;
        if (!lat || !lng) {
            return errorResponse(res, 'Latitude and longitude are required', 400);
        }

        const user = await User.findById(req.user.id);
        if (!user) return errorResponse(res, 'User not found', 404);

        user.location = { type: 'Point', coordinates: [lng, lat] };
        await user.save();

        return successResponse(res, 'User location updated successfully', 200, user);
    } catch (error) {
        return errorResponse(res, 'Server error', 500);
    }
};

// 📌 Search Locations (Cities/Colleges)
export const searchLocations = async (req, res) => {
    const query = req.query.q;
    if (!query) return res.json([]);

    try {
        const locations = await Location.find({
            name: { $regex: '^' + query, $options: 'i' }, // starts with (case-insensitive)
        }).limit(10);

        return successResponse(res, 'Locations fetched successfully', 200, locations);
    } catch (error) {
        console.error("Error searching locations:", error);
        return errorResponse(res, error.message || 'Server error', 500);
    }
};
