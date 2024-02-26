const db = require('../../config/database');
const { MailtrapClient } = require("mailtrap");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const indexController = {
    handleRootRequest: (req, res) => {
        return res.status(200).json({ Hello: 'Welcome to the Speed Dome Engineering Backend!' });
    },

//   handleBookCreation: (req, res) => {
//     const content = req.body.content;  

//     if (!content || content.trim() === '') {
//       return res.status(400).json({ error: 'Content cannot be empty' });
//     }

//     const sql = 'INSERT INTO books (title) VALUES (?)';
//     db.query(sql, [content], (err, result) => {
//       if (err) {
//         console.error('Error inserting data into the database:', err);
//         return res.status(500).json({ error: 'Internal Server Error' });
//       }
//       console.log('Data inserted into the database');
//       res.status(201).json({ message: 'Book created successfully' });
//     });
//   },
//   handleWaitlistUpdate: (req, res) => {
//     const { schoolName, firstName, lastName, email } = req.body;

//     if (!email) {
//       return res.status(400).json({ error: 'Email input was not completed.' });
//     }

//     // Check if the email already exists in the database
//     const checkEmailQuery = 'SELECT COUNT(*) AS emailCount FROM waitlist WHERE email = ?';
//     const checkEmailValues = [email];

//     db.query(checkEmailQuery, checkEmailValues, (checkErr, checkResult) => {
//       if (checkErr) {
//         console.error('Error checking email in the database:', checkErr);
//         return res.status(500).json({ error: 'Internal Server Error' });
//       }

//       const emailCount = checkResult[0].emailCount;

//       if (emailCount > 0) {
//         return res.status(409).json({ error: 'Error: You are already subscribed!' });
//       }

//       // ADD THE RECORD TO THE DATABASE TABLE
//       const sql = 'INSERT INTO waitlist (schoolName, firstName, lastName, email) VALUES (?, ?, ?, ?)';
//       const values = [schoolName, firstName, lastName, email];

//       db.query(sql, values, (err, result) => {
//         if (err) {
//           console.error('Error inserting data into the database:', err);
//           return res.status(500).json({ error: 'Internal Server Error' });
//         }
//         console.log('Data inserted into the database');

//         // MAILTRAP EMAIL NOTIFICATION
//         const TOKEN = process.env.MAILTRAP_API_TOKEN
//         const ENDPOINT = "https://send.api.mailtrap.io/";

//         const client = new MailtrapClient({ endpoint: ENDPOINT, token: TOKEN });

//         const sender = {
//           email: "hello@toddly.app",
//           name: "Toddly",
//         };
//         const recipients = [
//           {
//             email: "brandon@getsurmount.com",
//           }
//         ];
        
//         client
//           .send({
//             from: sender,
//             to: recipients,
//             subject: "New Waitlist Subscriber!",
//             text: "Congrats for getting a new subscriber!",
//             category: "Notification",
//           })
//           .then(console.log, console.error);

//         res.status(201).json({ message: 'Entry created successfully' });
//       });
//     });
//   },


//   handleCreateAccount: (req, res) => {
//     const { selectedOption } = req.body;
//     const registrationDate = new Date();

//     let firstName, lastName, email, password, passwordHash, isProvider, schoolName, phone, loginID;

//     // Different users will be submitting different forms.
//     if (selectedOption === 'parent') {
// 		({ firstName, lastName, email, password } = req.body);
// 		isProvider = 0;
//     } else {
// 		({ firstName, lastName, password, schoolName, phone, email } = req.body);
// 		isProvider = 1;
//     };

//     // Hash the password.
//     const passwordHashPromise = new Promise((resolve, reject) =>{
//       bcrypt.hash(password, 10, (err, passwordHash) => {
//         if (err) {
//           console.error('Error hashing password:', err);
//           reject(err);
//         } else {
//           // console.log("The hashed password is: ", passwordHash)
//           resolve(passwordHash);
//         }
//       });
//     });

//     // Receive the hashed password and add the user to the database.
//     Promise.all([passwordHashPromise]).then((passwordHash) => {
//         let sql = 'INSERT INTO UserLogins (firstName, lastName, email, passwordHash, isProvider, registrationDate) VALUES (?, ?, ?, ?, ?, ?)';
//         let values = [firstName, lastName, email, passwordHash, isProvider, registrationDate];
      
//         // Add the user to the UserLogin table before creating the matching
//         // record in the SchoolInfo table.
//         const userLoginPromise = new Promise((resolve, reject) => {
//           db.query(sql, values, (err, result) => {
//             if (err) {
//               console.error('Error inserting data into UserLogins:', err);
//               res.status(500).json({ error: 'Internal Server Error' });
//               reject(err);
//             } else {
//               console.log('Data inserted into UserLogins');
//               loginID = result.insertId
//               resolve();
//             }
//           });
//         });

//         Promise.all([userLoginPromise]).then(() => {
//             if (isProvider === 1) {
//               sql = 'INSERT INTO SchoolInfo (schoolName, phone, loginID) VALUES (?, ?, ?)';
//               values = [schoolName, phone, loginID];
          
//               db.query(sql, values, (err2) => {
//                 if (err2) {
//                   console.error('Error inserting data into SchoolInfo:', err2);
//                   return res.status(500).json({ error: 'Internal Server Error' });
//                 }
//                 console.log('Data inserted into SchoolInfo');
//                 res.status(200).json({ message: 'Data inserted successfully for school admin.' });
//               });
//             } else {
//               res.status(200).json({ message: 'Data inserted successfully for parent.' });
//             };
//         });
//     });
//   },



    // handleUserAuth: (req, res) => {
    //     const { email, password } = req.body;
    //     console.log('Email:', email);
    //     console.log('Password:', password);

    //     // Check if the email exists in the database.
    //     const getUserPromise = new Promise((resolve, reject) => {
    //     let sql = 'SELECT * FROM UserLogins WHERE email = ?';
    //     db.query(sql, [email], (err, results) => {
    //         if (err) {
    //         console.error('Error getting that user', err);
    //         reject(err);
    //         } else if (results.length === 0) {
    //         console.log('Email not found');
    //         res.status(400).json({ message: 'Email not found' });
    //         } else {
    //         const user = results[0];
    //         resolve(user);
    //         console.log('The user is: ', user);
    //         }
    //     });
    //     });
        
    //     Promise.all([getUserPromise]).then((results) => {
    //         const user = results[0]; // Extract the user object from the results array

    //         if (!user) {
    //             console.log('User not found');
    //             res.status(200).json({ message: 'User not found' });
    //             return;
    //         }  

    //         bcrypt.compare(password, user.passwordHash, (err, result) => {
    //             if (err) {
    //                 console.error('Error comparing passwords:', err);
    //                 res.status(500).json({ message: 'Internal server error' });

    //             } else if (result) {
    //                 // Log the user in.
    //                 console.log('Password is correct');
    //                 const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY
    //                 console.log("Creating a token for userid:", user.loginID)
    //                 const token = jwt.sign({ loginID: user.loginID }, JWT_SECRET_KEY, { 
    //                     expiresIn: '30d',
    //                 });

    //                 // Test to see if you can decode it:
    //                 jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
    //                     if (err) {
    //                         console.error('Token verification failed:', err.message);
    //                     } else {
    //                         console.log('Decoded Token:', decoded);
    //                     }
    //                 });
    //                 // Returns this:
    //                 // Decoded Token: { loginID: 13, iat: 1694975828, exp: 1697567828 }


    //                 //const cookieValue = 'your-cookie-value';
                    
    //                 res.status(200).json({ 
    //                     message: 'User Logged in. Cookie sent successfully.',
    //                     cookieValue: token,
    //                 });


    //             } else {
    //                 console.log('Sorry, that password does not match out records.');
    //                 res.status(401).json({ message: 'Sorry, that password does not match out records.' });
    //             }
    //         });
    //     })

    //     .catch((error) => {
    //         console.error('Promise error:', error);
    //         res.status(500).json({ message: 'Internal server error' });
    //     });  
    // },



//   logout: (req, res) => {
//     req.session.destroy((err) => {
//       if (err) {
//         console.error(err);
//       }
//       res.sendStatus(200);
//     });
//   }
}

module.exports = indexController;