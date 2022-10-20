const nodemailer = require("nodemailer");
require('dotenv').config();

async function myCustomMethod(ctx){
    console.log(ctx.auth.credentials.user,ctx.auth.credentials.pass);
    let cmd = await ctx.sendCommand(
        'AUTH PLAIN ' +
            Buffer.from(
                '\u0000' + ctx.auth.credentials.user + '\u0000' + ctx.auth.credentials.pass,
                'utf-8'
            ).toString('base64')
    );

    if(cmd.status < 200 || cmd.status >=300){
        throw new Error('Failed to authenticate user: ' + cmd.text);
    }
}

let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        type: 'custom',
        method: 'MY-CUSTOM-METHOD', // forces Nodemailer to use your custom handler
        // user: process.env.AUTH_EMAIL,  //if write this credential in .env file then it will not work
        // pass: process.env.AUTH_PASS   //if write this credential in .env file then it will not work
        user: "ranjitg325@gmail.com",    //change this later becoz it is not secure here
        pass: "amxaataaggzhrlth"         ////change this later becoz it is not secure here
    },
    customAuth: {
        'MY-CUSTOM-METHOD': myCustomMethod
    }
});


module.exports = transporter;