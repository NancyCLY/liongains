import React, { useEffect, useState, useCallback, useRef } from "react";
import { PlusIcon, HeartIcon } from "@heroicons/react/24/solid";
import lionIcon from "../assets/lion-blue.png";

import { fetchInitialVideos, fetchMoreVideos } from "../services/videoService";

/* -------------------------------------------------------------------------- */
/*                              VIDEO CARD                                    */
/* -------------------------------------------------------------------------- */
function VideoPost({ video }) {
  const { title, youtubeId, tags = [], posterName, createdAt } = video;

  const [liked, setLiked] = useState(false);
  const [animateLike, setAnimateLike] = useState(false);
  const lastTap = useRef(0);

  const timeLabel = createdAt?.toDate?.().toLocaleString() || "Recent";

  function handleLike() {
    setLiked((v) => !v);
    setAnimateLike(true);
    setTimeout(() => setAnimateLike(false), 400);
  }

  function handleDoubleTap() {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      if (!liked) handleLike();
    }
    lastTap.current = now;
  }

  return (
    <article className="bg-white border-b">
      {/* USER ROW */}
      <div className="flex items-center gap-3 px-4 pt-4">
        <div className="w-9 h-9 rounded-full bg-gray-300" />
        <span className="text-sm font-medium text-gray-800">
          @{posterName || "Unknown"}
        </span>
      </div>

      {/* VIDEO */}
      <div
        className="mt-3 mx-4 rounded-xl overflow-hidden bg-black shadow-sm"
        onClick={handleDoubleTap}
      >
        <iframe
          className="w-full aspect-video"
          src={`https://www.youtube.com/embed/${youtubeId}`}
          title={title}
          allowFullScreen
        />
      </div>

      {/* TITLE */}
      <div className="px-4 pt-3">
        <p className="text-sm font-medium text-gray-900">{title}</p>
      </div>

      {/* ACTION ROW */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* TAG */}
        <div>
          {tags.slice(0, 1).map((tag, i) => (
            <span
              key={i}
              className="px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* LIKE */}
        <button
          onClick={handleLike}
          className={`transition transform ${
            animateLike ? "scale-125" : "scale-100"
          }`}
        >
          <HeartIcon
            className={`w-6 h-6 ${liked ? "text-red-500" : "text-gray-300"}`}
          />
        </button>
      </div>

      {/* TIMESTAMP */}
      <div className="px-4 pb-4 text-xs text-gray-400">
        Posted at {timeLabel}
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*                             SKELETON CARD                                   */
/* -------------------------------------------------------------------------- */
function SkeletonPost() {
  return (
    <div className="animate-pulse bg-white border-b">
      <div className="flex items-center gap-3 px-4 pt-4">
        <div className="w-9 h-9 rounded-full bg-gray-200" />
        <div className="h-3 w-24 bg-gray-200 rounded" />
      </div>

      <div className="mt-3 mx-4 h-52 rounded-xl bg-gray-200" />

      <div className="px-4 pt-3">
        <div className="h-3 w-40 bg-gray-200 rounded" />
      </div>

      <div className="px-4 py-3 flex justify-between">
        <div className="h-5 w-16 bg-gray-200 rounded-full" />
        <div className="h-6 w-6 bg-gray-200 rounded-full" />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                HOME PAGE                                    */
/* -------------------------------------------------------------------------- */
export default function Home() {
  const [videos, setVideos] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  /* INITIAL FETCH */
  useEffect(() => {
    async function load() {
      const { videos, lastDoc } = await fetchInitialVideos(5);
      setVideos(videos);
      setLastDoc(lastDoc);
      setInitialLoading(false);
    }
    load();
  }, []);

  /* LOAD MORE */
  const loadMore = useCallback(async () => {
    if (!lastDoc || loadingMore) return;
    setLoadingMore(true);

    const { videos: moreVideos, lastDoc: newLastDoc } = await fetchMoreVideos(
      lastDoc,
      5
    );

    setVideos((prev) => [...prev, ...moreVideos]);
    setLastDoc(newLastDoc);
    setLoadingMore(false);
  }, [lastDoc, loadingMore]);

  /* INFINITE SCROLL */
  useEffect(() => {
    const onScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.offsetHeight - 200
      ) {
        loadMore();
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [loadMore]);

  return (
    <div className="pt-8 pb-28 bg-white">
      {/* HEADER */}
      <header className="fixed top-0 left-0 w-full bg-white border-b z-40">
        <div className="h-14 flex items-center justify-between px-4 max-w-md mx-auto">
          <img src={lionIcon} alt="LionGains" className="w-8 h-8" />
          <h1 className="text-2xl font-semibold text-gray-900">LionGains</h1>
          <button
            className="
              w-8 h-8 rounded-full border-2 border-blue-400
              flex items-center justify-center
              text-blue-400
              active:scale-95 transition
            "
          >
            <PlusIcon className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </header>

      {/* FEED */}
      <main className="max-w-md mx-auto space-y-6">
        {initialLoading &&
          Array.from({ length: 3 }).map((_, i) => <SkeletonPost key={i} />)}

        {videos.map((video) => (
          <VideoPost key={video.id} video={video} />
        ))}

        {loadingMore && (
          <p className="text-center text-sm text-gray-400 py-4">
            Loading more…
          </p>
        )}
      </main>
    </div>
  );
}
