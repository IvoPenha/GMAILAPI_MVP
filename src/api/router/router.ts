const express = require('express');
import * as controllers from '../controllers';
const router = express.Router();


//#region mails
router.get('/mail/user/', controllers.getUser)
router.get('/mail/send', controllers.sendMail);
router.get('/mail/readAnexos/:email', controllers.getAttachmentFromMessages)
router.post('/mail/login', controllers.login)
//#endregion

//#region Authentication
router.post('/signup', controllers.signUp)
router.post('/login', controllers.signIn)

//#endregion

//#region Profile
router.get('/profile/:userId', controllers.getProfileByUser)
router.get('/attachmentByProfile/:profileId', controllers.getAttachmentsByProfile)
router.post('/attachment', controllers.createAttachment)
//#endregion

export default router;