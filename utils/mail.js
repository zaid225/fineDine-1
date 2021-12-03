const nodemailer = require("nodemailer");


module.exports= function(receiver,subject,text){
  let testAccount = nodemailer.createTestAccount();
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  let info = {
    from: process.env.EMAIL, // sender address
    to:`${receiver}`, // list of receivers
    subject:`${subject}`,
    text: "Thanks for visiting us! ",
    html: `${text}`,
  };
  transporter.sendMail(info, (err, data) => {
    if (err) {
      console.log("Error occured:",err);
    } else {
      console.log("Email sent successfully");
    }
  });
};
