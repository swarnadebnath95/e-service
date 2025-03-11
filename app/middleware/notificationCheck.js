const { formatDistanceToNow } = require('date-fns');
const Notification = require('../module/frontened_module/customer_dashboard/model/notificationModel')


const notification = async (req, res, next) => {

    try {

        if (req.admin && req.admin.id) {
            const adminUserId = req.admin.id;

            const notifications = await Notification.find({ user: adminUserId }).sort({ createdAt: -1 }).lean();

            if (Array.isArray(notifications)) {
                notifications.forEach(notification => {
                    notification.relativeTime = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });
                });
            }

            // Set notifications globally for all views
            res.locals.notifications = notifications.filter(notification => !notification.read);
        }
    } catch (error) {
        console.log(error);
    }
    next();
}

module.exports = notification