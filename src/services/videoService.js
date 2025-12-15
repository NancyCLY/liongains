import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  increment,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

/* -------------------------------------------------------------------------- */
/*                             VIDEO QUERIES                                  */
/* -------------------------------------------------------------------------- */

export async function fetchInitialVideos(pageSize = 5) {
  const q = query(
    collection(db, "videos"),
    orderBy("createdAt", "desc"),
    limit(pageSize)
  );

  const snap = await getDocs(q);

  return {
    videos: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
    lastDoc: snap.docs[snap.docs.length - 1] || null,
  };
}

export async function fetchMoreVideos(lastDoc, pageSize = 5) {
  if (!lastDoc) {
    return { videos: [], lastDoc: null };
  }

  const q = query(
    collection(db, "videos"),
    orderBy("createdAt", "desc"),
    startAfter(lastDoc),
    limit(pageSize)
  );

  const snap = await getDocs(q);

  return {
    videos: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
    lastDoc: snap.docs[snap.docs.length - 1] || null,
  };
}

/* -------------------- LIKE VIDEO -------------------- */
export async function likeVideo(videoId, userId) {
  const likeRef = doc(db, "videos", videoId, "likes", userId);
  const videoRef = doc(db, "videos", videoId);

  await setDoc(likeRef, {
    likedAt: serverTimestamp(),
  });

  await updateDoc(videoRef, {
    likeCount: increment(1),
  });
}

/* -------------------- UNLIKE VIDEO -------------------- */
export async function unlikeVideo(videoId, userId) {
  const likeRef = doc(db, "videos", videoId, "likes", userId);
  const videoRef = doc(db, "videos", videoId);

  await deleteDoc(likeRef);

  await updateDoc(videoRef, {
    likeCount: increment(-1),
  });
}

/* -------------------- CHECK IF USER LIKED -------------------- */
export async function hasUserLiked(videoId, userId) {
  const likeRef = doc(db, "videos", videoId, "likes", userId);
  const snap = await getDoc(likeRef);
  return snap.exists();
}