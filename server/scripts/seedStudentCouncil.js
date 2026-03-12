/**
 * Seed Student Council members with their photos
 * Photos should already exist in server/uploads/ as council-*.png
 * Usage: node scripts/seedStudentCouncil.js
 */
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const StudentCouncil = require('../models/StudentCouncil');

const councilMembers = [
    {
        name: 'Abhishek Upadhyay',
        position: 'General Secretary',
        department: 'Computer Science Engineering',
        photo: '/uploads/council-abhishek-upadhyay.png',
        order: 1,
        isActive: true
    },
    {
        name: 'Anuj Kumar',
        position: 'Joint General Secretary',
        department: 'Electrical Engineering',
        photo: '/uploads/council-anuj-kumar.png',
        order: 2,
        isActive: true
    },
    {
        name: 'Atharav Jadhav',
        position: 'Sports Secretary',
        department: 'Mechanical Engineering',
        photo: '/uploads/council-atharav-jadhav.png',
        order: 3,
        isActive: true
    },
    {
        name: 'Himanshu Rayudu',
        position: 'Joint Sports Secretary',
        department: 'Electronics Engineering',
        photo: '/uploads/council-himanshu-rayudu.png',
        order: 4,
        isActive: true
    },
    {
        name: 'Kushal Joshi',
        position: 'Cultural Secretary',
        department: 'Civil Engineering',
        photo: '/uploads/council-kushal-joshi.png',
        order: 5,
        isActive: true
    },
    {
        name: 'Manasi Pawar',
        position: 'Ladies Representative',
        department: 'Chemical Engineering',
        photo: '/uploads/council-manasi-pawar.png',
        order: 6,
        isActive: true
    },
    {
        name: 'Mohammed Nawaz',
        position: 'Technical Secretary',
        department: 'Computer Science Engineering',
        photo: '/uploads/council-mohammed-nawaz.png',
        order: 7,
        isActive: true
    },
    {
        name: 'Onkar Deshmukh',
        position: 'Treasurer',
        department: 'Metallurgical Engineering',
        photo: '/uploads/council-onkar-deshmukh.png',
        order: 8,
        isActive: true
    },
    {
        name: 'Premanshu Pradhan',
        position: 'Joint Cultural Secretary',
        department: 'Mining Engineering',
        photo: '/uploads/council-premanshu-pradhan.png',
        order: 9,
        isActive: true
    },
    {
        name: 'Rishabh Jha',
        position: 'Public Relations Officer',
        department: 'Electrical Engineering',
        photo: '/uploads/council-rishabh-jha.png',
        order: 10,
        isActive: true
    },
    {
        name: 'Rohit Shrivas',
        position: 'Joint Technical Secretary',
        department: 'Civil Engineering',
        photo: '/uploads/council-rohit-shrivas.png',
        order: 11,
        isActive: true
    },
    {
        name: 'Sarvesh Patil',
        position: 'Hostel Affairs Secretary',
        department: 'Mechanical Engineering',
        photo: '/uploads/council-sarvesh-patil.png',
        order: 12,
        isActive: true
    },
    {
        name: 'Shreyansh Mishra',
        position: 'Academic Affairs Secretary',
        department: 'Computer Science Engineering',
        photo: '/uploads/council-shreyansh-mishra.png',
        order: 13,
        isActive: true
    },
    {
        name: 'Spruha Kshirsagar',
        position: 'Joint Ladies Representative',
        department: 'Electronics Engineering',
        photo: '/uploads/council-spruha-kshirsagar.png',
        order: 14,
        isActive: true
    },
    {
        name: 'Sumit Gole',
        position: 'Mess Secretary',
        department: 'Chemical Engineering',
        photo: '/uploads/council-sumit-gole.png',
        order: 15,
        isActive: true
    }
];

async function seedCouncil() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing council
        const existing = await StudentCouncil.countDocuments();
        if (existing > 0) {
            await StudentCouncil.deleteMany({});
            console.log(`  🗑️  Cleared ${existing} existing members`);
        }

        // Insert new members
        const inserted = await StudentCouncil.insertMany(councilMembers);
        console.log(`  ✅ Seeded ${inserted.length} student council members:`);
        inserted.forEach((m, i) => {
            console.log(`    ${i + 1}. ${m.name} — ${m.position}`);
        });

        await mongoose.disconnect();
        console.log('✅ Done!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

seedCouncil();
