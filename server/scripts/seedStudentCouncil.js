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
        name: 'Rohit Shrivas',
        position: 'General Secretary',
        department: 'Civil Engineering',
        photo: '/uploads/council-rohit.png',
        phone: '6261801440',
        email: 'generalsecretary@students.vnit.ac.in',
        order: 1,
        isActive: true
    },
    {
        name: 'Manasi Pawar',
        position: 'Ladies Representative',
        department: 'Architecture & Planning',
        photo: '/uploads/council-manasi.png',
        phone: '8855902895',
        email: 'ladiesrepresentative@students.vnit.ac.in',
        order: 2,
        isActive: true
    },
    {
        name: 'Sarvesh Patil',
        position: 'Academic Affairs Secretary (U.G)',
        department: 'Mechanical Engineering',
        photo: '/uploads/council-sarvesh.png',
        phone: '7875501375',
        email: 'ugacademicsecretary@students.vnit.ac.in',
        order: 3,
        isActive: true
    },
    {
        name: 'Mohammed Nawaz',
        position: 'Academic Affairs Secretary (P.G)',
        department: 'Mining & Vibrational Dynamics',
        photo: '/uploads/council-nawaz.png',
        phone: '9989563579',
        email: 'pgacademicsecretary@students.vnit.ac.in',
        order: 4,
        isActive: true
    },
    {
        name: 'Onkar Deshmukh',
        position: 'Academic Affairs Secretary (PhD)',
        department: 'Computer Science Engineering',
        photo: '/uploads/council-onkar.png',
        phone: '9284944232',
        email: 'phdacademicsecretary@students.vnit.ac.in',
        order: 5,
        isActive: true
    },
    {
        name: 'Atharav Jadhav',
        position: 'Magazine & Literary Affairs Secretary',
        department: 'Civil Engineering',
        photo: '/uploads/council-atharav.png',
        phone: '9322065675',
        email: 'literarysecretary@students.vnit.ac.in',
        order: 6,
        isActive: true
    },
    {
        name: 'Rishabh Jha',
        position: 'Training and Placement Secretary',
        department: 'Mechanical Engineering',
        photo: '/uploads/council-rishabh.png',
        phone: '8887614899',
        email: 'tnpsecretary@students.vnit.ac.in',
        order: 7,
        isActive: true
    },
    {
        name: 'Shreyansh Mishra',
        position: 'Technical Affairs Secretary',
        department: 'Electronics & Communication Engineering',
        photo: '/uploads/council-shreyansh.png',
        phone: '7977750388',
        email: 'technicalsecretary@students.vnit.ac.in',
        order: 8,
        isActive: true
    },
    {
        name: 'Himanshu Rayudu',
        position: 'Sports Secretary',
        department: 'Mechanical Engineering',
        photo: '/uploads/council-himanshu.png',
        phone: '7388688743',
        email: 'sportssecretary@students.vnit.ac.in',
        order: 9,
        isActive: true
    },
    {
        name: 'Anuj Kumar',
        position: 'Cultural Secretary',
        department: 'Electrical & Electronics Engineering',
        photo: '/uploads/council-anuj.png',
        phone: '9267950517',
        email: 'culturalsecretary@students.vnit.ac.in',
        order: 10,
        isActive: true
    },
    {
        name: 'Sumit Gole',
        position: 'Sports & Cultural Affairs Secretary (P.G)',
        department: 'Structures Engineering',
        photo: '/uploads/council-sumit.png',
        phone: '9767442910',
        email: 'pgsportsandcultsecretary@students.vnit.ac.in',
        order: 11,
        isActive: true
    },
    {
        name: 'Kushal Joshi',
        position: 'Hostel Affairs Secretary (Boys)',
        department: 'Architecture & Planning',
        photo: '/uploads/council-kushal.png',
        phone: '9552183303',
        email: 'boyshostelsecretary@students.vnit.ac.in',
        order: 12,
        isActive: true
    },
    {
        name: 'Spruha Kshirsagar',
        position: 'Hostel Affairs Secretary (Girls)',
        department: 'Electrical & Electronics Engineering',
        photo: '/uploads/council-spruha.png',
        phone: '8208749436',
        email: 'girlshostelsecretary@students.vnit.ac.in',
        order: 13,
        isActive: true
    },
    {
        name: 'Abhishek Upadhyay',
        position: 'Social Affairs Secretary',
        department: 'Mechanical Engineering',
        photo: '/uploads/council-abhishek.png',
        phone: '9323667608',
        email: 'socialsec@students.vnit.ac.in',
        order: 14,
        isActive: true
    },
    {
        name: 'Premanshu Pradhan',
        position: 'Alumni Affairs Secretary',
        department: 'Mechanical Engineering',
        photo: '/uploads/council-premanshu.png',
        phone: '9937067772',
        email: 'alumnisecretary@students.vnit.ac.in',
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
            console.log(`    ${i + 1}. ${m.name} — ${m.position} (${m.department})`);
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
