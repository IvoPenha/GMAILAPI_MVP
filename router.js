const express = require('express');
const controllers= require('./controllers');
const router = express.Router();

router.get('/mail/user/', controllers.getUser)
router.get('/mail/send', controllers.sendMail);
router.get('/mail/drafts/:email', controllers.getDrafts);
router.get('/mail/read/:messageId', controllers.readMail);
router.get('/mail/readAnexos/:email', controllers.getAttachmentFromMessages)
router.post('/mail/login', controllers.login)

module.exports = router;