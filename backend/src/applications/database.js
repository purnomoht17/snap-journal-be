import { getFirestore } from "firebase-admin/firestore";
import { firebaseApp } from "./firebase.js";
import { logger } from "./logging.js";

const database = getFirestore(firebaseApp, "snap-journal-db");

try {
    if (database) {
        logger.info("Firestore Database Client ready (Connected to: snap-journal-db)");
    } else {
        throw new Error("Firestore instance is undefined");
    }
} catch (error) {
    logger.error(`Database Setup Error: ${error.message}`);
}

export { database };