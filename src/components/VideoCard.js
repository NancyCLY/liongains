import React, { useState } from "react";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";

export default function VideoCard({ video }) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
      {/* Poster Info */}
      <div className="flex items-center px-4 py-3">
        <img
          src={video.posterPic}
          alt="profile"
          className="w-10 h-10 rounded-full mr-3 object-cover"
        />
        <div>
          <p className="font-semibold text-sm">{video.posterName}</p>
          <p className="text-xs text-gray-500">{video.timestamp}</p>
        </div>
      </div>

      {/* Video */}
      <div className="bg-black">
        <video
          controls
          src={video.videoUrl}
          className="w-full h-64 object-cover"
        />
      </div>

      {/* Title */}
      <div className="px-4 pt-3 pb-2">
        <h3 className="text-lg font-semibold leading-tight">{video.title}</h3>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 px-4 pb-3">
        {video.tags.map((tag, index) => (
          <span
            key={index}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Like Button */}
      <div className="px-4 pb-4">
        <button
          onClick={() => setLiked(!liked)}
          className="transition active:scale-90"
        >
          {liked ? (
            <HeartSolid className="h-6 w-6 text-red-500" />
          ) : (
            <HeartOutline className="h-6 w-6 text-gray-600" />
          )}
        </button>
      </div>
    </div>
  );
}
