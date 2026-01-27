import journalService from "../services/journal-service.js";
import aiHelperService from "../services/ai-helper-service.js"

const createJournal = async (req, res, next) => {
    try {
        const result = await journalService.createJournal(req.user, req.body, req.file);

        res.status(201).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const listJournal = async (req, res, next) => {
    try {
        const result = await journalService.listJournal(req.user, req.query);
        res.status(200).json(result);
    } catch (e) {
        next(e);
    }
}

const getDetailJournal = async (req, res, next) => {
    try {
        const journalId = req.params.id;
        const result = await journalService.getDetailJournal(req.user, journalId);

        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const updateJournal = async (req, res, next) => {
    try {
        const journalId = req.params.id;
        const request = req.body;
        const result = await journalService.updateJournal(req.user, request, journalId);
        
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const deleteJournal = async (req, res, next) => {
    try {
        const journalId = req.params.id;
        
        const result = await journalService.deleteJournal(req.user, journalId);
        
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const enhanceText = async (req, res, next) => {
    try {
        const result = await aiHelperService.enhanceJournalText(req.body);
        
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

export default {
    createJournal,
    listJournal,
    getDetailJournal,
    updateJournal,
    deleteJournal,
    enhanceText
}