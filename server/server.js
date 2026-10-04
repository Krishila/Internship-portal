const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();


// ======================================================
// MIDDLEWARE
// ======================================================

app.use(
    cors({
        origin: 'http://localhost:3000',
        credentials: true
    })
);

app.use(
    express.json({
        limit: '50mb'
    })
);

app.use(
    express.urlencoded({
        limit: '50mb',
        extended: true
    })
);


// ======================================================
// IMPORT ROUTES
// ======================================================

const authRoutes =
    require('./routes/authRoutes');

const userRoutes =
    require('./routes/userRoutes');

const internshipRoutes =
    require('./routes/internshipRoutes');

const applicationRoutes =
    require('./routes/applicationRoutes');

const employerRoutes =
    require('./routes/employerRoutes');

const jobRoutes =
    require('./routes/jobRoutes');

const adminRoutes =
    require('./routes/admin');


// ======================================================
// API ROUTES
// ======================================================

app.use(
    '/api/auth',
    authRoutes
);

app.use(
    '/api/user',
    userRoutes
);

app.use(
    '/api/internships',
    internshipRoutes
);

app.use(
    '/api/admin',
    adminRoutes
);

app.use(
    '/api/applications',
    applicationRoutes
);

app.use(
    '/api/employer',
    employerRoutes
);

app.use(
    '/api/jobs',
    jobRoutes
);


// ======================================================
// TEST ROUTE
// ======================================================

app.get('/', (req, res) => {
    res.json({
        message: 'Backend Server is Running!',
        status: 'OK'
    });
});


// ======================================================
// API 404 HANDLER
// ======================================================

app.use((req, res) => {

    res.status(404).json({
        message: 'API route not found',
        method: req.method,
        path: req.originalUrl
    });

});


// ======================================================
// ERROR HANDLER
// ======================================================

app.use((err, req, res, next) => {

    console.error('Server Error:', err);

    res.status(500).json({
        message: 'Internal server error'
    });

});


// ======================================================
// START SERVER
// ======================================================

const PORT =
    process.env.PORT || 5000;

app.listen(
    PORT,
    () => {

        console.log(
            `Server running on http://localhost:${PORT}`
        );

        console.log(
            'Application routes loaded: /api/applications'
        );

    }
);