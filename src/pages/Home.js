import React, { useEffect, useState, useCallback } from "react";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { db } from "../services/firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
} from "firebase/firestore";

/* --------------------------------------------------------------------------
   VIDEO POST COMPONENT — Styled according to liongainshome.css structure
   -------------------------------------------------------------------------- */
function VideoPost({ video }) {
  const { title, youtubeId, tags = [], posterName, createdAt } = video;

  const timeAgo = createdAt?.toDate?.().toLocaleString() || "Recent";

  return (
    <article className="w-[568px] mx-auto bg-white border rounded-lg overflow-hidden shadow">
      {/* tweet-head */}
      <div className="tweet-head flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-300" />
          <span className="font-semibold text-gray-800">
            @{posterName || "user"}
          </span>
        </div>
        <span className="text-xs text-gray-500">{timeAgo}</span>
      </div>

      {/* tweet-body */}
      <div className="tweet-body px-4 py-3">
        <p className="text-gray-800 text-base font-medium">{title}</p>
      </div>

      {/* tweet-image-container */}
      <div className="tweet-image-container bg-black">
        <iframe
          className="w-full aspect-video"
          src={`https://www.youtube.com/embed/${youtubeId}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* tweet-timestamp */}
      <div className="tweet-timestamp px-4 py-2 text-sm text-gray-500 border-t">
        Posted at: {timeAgo}
      </div>

      {/* tweet-discussion */}
      <div className="tweet-discussion px-4 py-2 flex flex-wrap gap-2 border-t bg-gray-50">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* tweet-sharing */}
      <div className="tweet-sharing flex items-center justify-end px-4 py-3 border-t bg-white">
        <button className="text-gray-500 hover:text-red-500 text-xl transition">
          ❤️
        </button>
      </div>
    </article>
  );
}

/* --------------------------------------------------------------------------
   MAIN HOME PAGE
   -------------------------------------------------------------------------- */
export default function Home() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  /* FETCH INITIAL VIDEOS */
  useEffect(() => {
    const loadInitial = async () => {
      const q = query(
        collection(db, "videos"),
        orderBy("createdAt", "desc"),
        limit(5)
      );

      const snapshot = await getDocs(q);
      setVideos(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
    };

    loadInitial();
  }, []);

  /* LOAD MORE VIDEOS */
  const loadMore = useCallback(async () => {
    if (!lastDoc) return;

    setLoadingMore(true);

    const q = query(
      collection(db, "videos"),
      orderBy("createdAt", "desc"),
      startAfter(lastDoc),
      limit(5)
    );

    const snapshot = await getDocs(q);
    setVideos((prev) => [
      ...prev,
      ...snapshot.docs.map((d) => ({ id: d.id, ...d.data() })),
    ]);

    setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
    setLoadingMore(false);
  }, [lastDoc]);

  /* SCROLL HANDLER */
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.innerHeight + window.scrollY;
      const bottom = document.documentElement.offsetHeight - 200;

      if (offset >= bottom && !loadingMore) {
        loadMore();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMore, loadingMore]);

  /* RENDER */
  return (
    <div className="pt-16 pb-32">
      {/* FEED */}
      <div className="mt-6 space-y-6">
        {videos.length === 0 && (
          <p className="text-center text-gray-500">No videos yet…</p>
        )}

        {videos.map((video) => (
          <VideoPost key={video.id} video={video} />
        ))}

        {loadingMore && (
          <p className="text-center text-gray-400">Loading more…</p>
        )}
      </div>
    </div>
  );
}
