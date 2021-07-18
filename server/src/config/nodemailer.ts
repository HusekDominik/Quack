import nodemailer from "nodemailer";
const EMAIL_FROM = "info-noreply@quackpage.com";

// DEVELOPMENT VERSION 

// const transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: 465,
//     secure: true,
//     auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS
//     },
//     tls: {
//         secureProtocol: 'TLSv1_2_method'
//     }
// });

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        secureProtocol: 'TLSv1_2_method'
    }
});


const sendVerifyEmailFunc = async(EMAIL_TOKEN, email : string) : Promise<void> => {

    const currentLink  = `http://localhost:${process.env.PORT}/email/confirmation/${EMAIL_TOKEN}`;

    const htmlBody = `<div>
                        <h1>VERIFY YOUR ACCOUNT</h1>
                        <a href="${currentLink}">${currentLink}</a>
                     </div>`;

    const mainOptions = {
        from: EMAIL_FROM,
        to: email,
        subject: 'quackpage-Confirm email verification',
        html: htmlBody

    }
    transporter.sendMail(mainOptions, (error, _) => {
        if(error){
            console.log(error);
            let err = new Error(error.message);
            throw err;
        }
    })
}

const sendNewPasswordFunc = async(username : string, password : string, email : string) : Promise<void> => {
    const currentLink = `http://localhost:${process.env.PORT}/forgotten/password/${username}/${password}`;
    const htmlBody = `<div>
                        <h1>Confirm Password change by clicking on the link below</h1>
                        <a href="${currentLink}">${currentLink}</a>
                    </div>`;

    const mainOptions = {
        from: EMAIL_FROM,
        to: email,
        subject: 'Quack - Reset your password',
        html: htmlBody
    }
    
    transporter.sendMail(mainOptions, (error, _) => {
        if(error){
            console.log(error);
            let err = new Error(error.message);
            throw err;
        }
    })
}
export {sendVerifyEmailFunc, sendNewPasswordFunc};


