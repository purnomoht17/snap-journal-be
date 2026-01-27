import express from "express";
import { authMiddleware } from "../middlewares/auth-middleware.js";
import { verifiedMiddleware } from "../middlewares/verified-middleware.js";
import { upload } from "../middlewares/upload-middleware.js";
import { runValidation } from "../middlewares/validation-middleware.js";
import { createJournalValidation, updateJournalValidation} from "../validations/journal-validation.js";
import journalController from "../controllers/journal-controller.js";

const journalRouter = new express.Router();

journalRouter.use(authMiddleware);
journalRouter.use(verifiedMiddleware);

journalRouter.post('/api/v1/journals', 
    upload.single('video'),
    runValidation(createJournalValidation),
    journalController.createJournal
);

journalRouter.get('/api/v1/journals', journalController.listJournal);
journalRouter.get('/api/v1/journals/:id', journalController.getDetailJournal);
journalRouter.put('/api/v1/journals/:id', 
    runValidation(updateJournalValidation),
    journalController.updateJournal
);

journalRouter.delete('/api/v1/journals/:id', journalController.deleteJournal);
journalRouter.post('/api/v1/journals/enhance', journalController.enhanceText);

export { journalRouter };