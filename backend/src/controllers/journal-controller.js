import journalService from "../services/journal-service.js";
import { parseMultipart } from "../utils/multipart-parser.js";

const createJournal = async (req, res, next) => {
    try {
        const user = req.user;

        const parsed = await parseMultipart(req);
        const request = parsed.fields;
        const files = parsed.files;
        const videoFile = files.find(f => f.fieldname === 'video') || null;
        const photoFile = files.find(f => f.fieldname === 'photo') || null;

        const result = await journalService.createJournal(user, request, videoFile, photoFile);

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
        const user = req.user;
        const id = req.params.id;
        const parsed = await parseMultipart(req);
        const request = parsed.fields;
        const files = parsed.files;

        const photoFile = files.find(f => f.fieldname === 'photo') || null;

        const result = await journalService.updateJournal(user, request, photoFile, id);

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
        const result = await journalService.enhanceJournalText(req.user, req.body);
        res.status(200).json({ data: result });
    } catch (e) {
        next(e);
    }
};

const chat = async (req, res, next) => {
    try {
        const user = req.user;
        const id = req.params.id;
        const request = req.body; 

        const result = await journalService.chat(user, id, request);

        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const analyze = async (req, res, next) => {
    try {
        const user = req.user;
        const id = req.params.id;

        const result = await journalService.analyze(user, id);

        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const getMoodCalendar = async (req, res, next) => {
    try {
        const user = req.user;
        const request = req.query;

        const result = await journalService.getMoodCalendar(user, request);

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
    enhanceText,
    chat,
    analyze,
    getMoodCalendar
}