/**
 * Event API — Frontend helper functions for /api/events endpoints
 */
import api from './axiosConfig';

/** Fetch all events (with optional filters) */
export const fetchEvents = async (params = {}) => {
    const res = await api.get('/events', { params });
    return res.data;
};

/** Fetch single event by ID */
export const fetchEvent = async (id) => {
    const res = await api.get(`/events/${id}`);
    return res.data;
};

/** Create a new event (admin) */
export const createEvent = async (data) => {
    const res = await api.post('/events', data);
    return res.data;
};

/** Update event details (admin) */
export const updateEvent = async (id, data) => {
    const res = await api.put(`/events/${id}`, data);
    return res.data;
};

/** Record results for an event (admin) */
export const recordResults = async (id, results) => {
    const res = await api.put(`/events/${id}/results`, { results });
    return res.data;
};

/** Award points from event results (admin) */
export const awardEventPoints = async (id) => {
    const res = await api.post(`/events/${id}/award`);
    return res.data;
};

/** Delete an event (admin) */
export const deleteEvent = async (id) => {
    const res = await api.delete(`/events/${id}`);
    return res.data;
};
