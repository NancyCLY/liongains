import {
  collection,
  query,
  orderBy,
  getDocs,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "./firebase";

/* -------------------------------------------------------------------------- */
/*                               HOME FEED API                                */
/* -------------------------------------------------------------------------- */

/**
 * Fetch initial videos for Home page
 * @param {number} limitCount
 * @returns {Promise<{videos: any[], lastDoc: any|null}>}
 */
export async function fetchInitialVideos(limitCount = 5) {
  const q = query(
    collection(db, "videos"),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );

  const snap = await getDocs(q);

  const videos = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));

  const lastDoc = snap.docs[snap.docs.length - 1] || null;

  return { videos, lastDoc };
}

/**
 * Fetch more videos for Home page (pagination)
 * @param {any} lastDoc
 * @param {number} limitCount
 * @returns {Promise<{videos: any[], lastDoc: any|null}>}
 */
export async function fetchMoreVideos(lastDoc, limitCount = 5) {
  if (!lastDoc) return { videos: [], lastDoc: null };

  const q = query(
    collection(db, "videos"),
    orderBy("createdAt", "desc"),
    startAfter(lastDoc),
    limit(limitCount)
  );

  const snap = await getDocs(q);

  const videos = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));

  const newLastDoc = snap.docs[snap.docs.length - 1] || null;

  return { videos, lastDoc: newLastDoc };
}

/* -------------------------------------------------------------------------- */
/*                               SEARCH PAGE API                              */
/* -------------------------------------------------------------------------- */

/**
 * Fetch videos for Search page.
 * Firestore does NOT support partial text search on title,
 * so we fetch a batch and filter client-side in Search.js.
 * @param {number} limitCount
 * @returns {Promise<any[]>}
 */
export async function fetchVideosForSearch(limitCount = 50) {
  const q = query(
    collection(db, "videos"),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}
