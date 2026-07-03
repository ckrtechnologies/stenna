import { fetchEnquiries, updateEnquiryStatus, deleteEnquiry } from '../lib/enquiry.service.js';

export const getEnquiries = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const search = req.query.search || '';
        const startDate = req.query.startDate || null;
        const endDate = req.query.endDate || null;

        const data = await fetchEnquiries(page, limit, search, startDate, endDate);
        res.json({ success: true, data });
    } catch (error) {
        console.error('Error in getEnquiries:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch enquiries' });
    }
};

export const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!['Pending', 'Processing', 'Resolved'].includes(status)) {
            return res.status(400).json({ success: false, error: 'Invalid status' });
        }
        
        const data = await updateEnquiryStatus(id, status);
        res.json({ success: true, data });
    } catch (error) {
        console.error('Error in updateStatus:', error);
        res.status(500).json({ success: false, error: 'Failed to update enquiry status' });
    }
};

export const removeEnquiry = async (req, res) => {
    try {
        const { id } = req.params;
        await deleteEnquiry(id);
        res.json({ success: true, message: 'Enquiry deleted' });
    } catch (error) {
        console.error('Error in removeEnquiry:', error);
        res.status(500).json({ success: false, error: 'Failed to delete enquiry' });
    }
};
