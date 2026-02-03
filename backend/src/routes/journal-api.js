import express from "express";
import { authMiddleware } from "../middlewares/auth-middleware.js";
import { verifiedMiddleware } from "../middlewares/verified-middleware.js";
import { runValidation } from "../middlewares/validation-middleware.js";
import { createJournalValidation, updateJournalValidation } from "../validations/journal-validation.js";
import { multipartMiddleware } from "../middlewares/multipart-middleware.js";
import journalController from "../controllers/journal-controller.js";

const journalRouter = new express.Router();

journalRouter.use(authMiddleware);
journalRouter.use(verifiedMiddleware);

journalRouter.post('/api/v1/journals', 
    multipartMiddleware,
    runValidation(createJournalValidation),
    journalController.createJournal
);

journalRouter.get('/api/v1/journals', journalController.listJournal);
journalRouter.get('/api/v1/journals/mood-calendar', journalController.getMoodCalendar);
journalRouter.post('/api/v1/journals/enhance', journalController.enhanceText);
journalRouter.get('/api/v1/journals/:id', journalController.getDetailJournal);

journalRouter.put('/api/v1/journals/:id', 
    multipartMiddleware,
    runValidation(updateJournalValidation),
    journalController.updateJournal
);

journalRouter.delete('/api/v1/journals/:id', journalController.deleteJournal);
journalRouter.post('/api/v1/journals/:id/chat', journalController.chat);
journalRouter.post('/api/v1/journals/:id/analyze', journalController.analyze);

export { journalRouter };