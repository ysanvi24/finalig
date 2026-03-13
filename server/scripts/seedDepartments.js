const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Department = require('../models/Department');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const departments = [
    { name: 'Computer Science Engineering', shortCode: 'CSE' },
    { name: 'Electronics & Communication Engineering', shortCode: 'ECE' },
    { name: 'Electrical & Electronics Engineering', shortCode: 'EEE' },
    { name: 'Mechanical Engineering', shortCode: 'MECH' },
    { name: 'Chemical & Mining Engineering', shortCode: 'CHEMINE' },
    { name: 'Civil Engineering', shortCode: 'CIVIL' },
    { name: 'Metallurgical & Materials Engineering', shortCode: 'META' },
    { name: 'Architecture & Planning', shortCode: 'ARCH' }
];

const seedDepartments = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Clear existing departments
        console.log('Clearing existing departments...');
        await Department.deleteMany({});
        console.log('Departments cleared');

        // Insert new departments
        console.log('Seeding departments...');
        const createdDepartments = await Department.insertMany(departments);

        console.log('Departments seeded successfully:');
        createdDepartments.forEach(dept => {
            console.log(`${dept.name} (${dept.shortCode}): ${dept._id}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error seeding departments:', error);
        process.exit(1);
    }
};

seedDepartments();
