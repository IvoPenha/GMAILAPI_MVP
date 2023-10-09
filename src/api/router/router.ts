import express from "express";
import * as controllers from "../controllers";
import { verificarToken } from "../middleware";
const router = express.Router();

//#region mails
router.get("/mail/user/", controllers.getUser);
router.get("/mail/send", controllers.sendMail);
router.get(
  "/mail/readAnexos/:email",
  verificarToken,
  controllers.getAttachmentFromMessages
);
router.post("/mail/authorizationCode", controllers.handleAuthorizationCode);
//#endregion

//#region Authentication
router.post("/signup", controllers.signUp);
router.post("/login", controllers.signIn);
//#endregion

//#region Anexos
router.post("/attachment", verificarToken, controllers.createAnexo);
router.get(
  "/boletos/:perfilId",
  verificarToken,
  controllers.readBoletosByProfileId
);
//#endregion

//#region Profile
router.get("/profile/:userId", controllers.getProfileByUser);
router.get(
  "/attachmentByProfile/:profileId",
  controllers.getAttachmentsByProfile
);
router.put("/profile/:usuarioId", controllers.updateProfile);
//#endregion

export default router;
