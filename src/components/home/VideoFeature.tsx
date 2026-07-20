"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, Play } from "lucide-react";

interface VideoFeatureProps {
  videoId: string;
  title: string;
}

/**
 * YouTube 视频展示组件
 *
 * 行为：
 * 1. 初始展示缩略图 + 播放按钮（点击即可播放，作为可靠后备）
 * 2. 滚动进入视口（可见度 ≥ 50%）时通过 IntersectionObserver 自动启动播放
 * 3. 启动后使用 autoplay + mute + loop + playlist 实现静音循环自动播放
 *    （浏览器策略要求自动播放必须静音）
 */
export function VideoFeature({ videoId, title }: VideoFeatureProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fellBackRef = useRef(false);
  const [started, setStarted] = useState(false);
  const [thumbSrc, setThumbSrc] = useState(
    `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
  );

  const watchUrl = useMemo(
    () => `https://www.youtube.com/watch?v=${videoId}`,
    [videoId],
  );

  // 静音自动播放 + 循环（loop 需要 playlist 参数指向同一视频才生效）
  const embedUrl = useMemo(
    () =>
      `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&playsinline=1&rel=0`,
    [videoId],
  );

  // 视口内自动启动
  useEffect(() => {
    if (started) return;
    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            setStarted(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [started]);

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-lg"
        style={{ paddingBottom: "56.25%" }}
      >
        {started ? (
          <iframe
            className="absolute top-0 left-0 h-full w-full"
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <button
            type="button"
            onClick={() => setStarted(true)}
            aria-label={`Play ${title}`}
            className="group absolute inset-0 h-full w-full cursor-pointer"
          >
            <img
              src={thumbSrc}
              alt={title}
              loading="lazy"
              onError={() => {
                if (fellBackRef.current) return;
                fellBackRef.current = true;
                setThumbSrc(
                  `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
                );
              }}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span
              aria-hidden
              className="absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/40"
            />
            <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[hsl(var(--nav-theme))] text-white shadow-lg ring-4 ring-white/30 transition-transform group-hover:scale-110">
              <Play className="ml-1 h-7 w-7 fill-current" />
            </span>
          </button>
        )}
      </div>

      <div className="flex justify-center">
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
        >
          Watch on YouTube
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
