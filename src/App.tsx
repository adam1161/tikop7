import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Loader2 } from "lucide-react";

const API_ENDPOINT = "https://www.tikwm.com/api/";

type DownloadState = "idle" | "loading" | "success" | "error";

type TikTokResponse = {
  code: number;
  msg: string;
  data?: {
    play: string;
    title: string;
    author: {
      nickname: string;
    };
    cover: string;
  };
};

function App() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<DownloadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<TikTokResponse["data"] | null>(null);

  const handleDownload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!url.trim()) {
      setError("Please paste a TikTok link.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setError(null);
    setVideoData(null);

    try {
      const response = await fetch(`${API_ENDPOINT}?url=${encodeURIComponent(url.trim())}`);
      if (!response.ok) {
        throw new Error("Failed to contact the download service. Please try again.");
      }

      const payload: TikTokResponse = await response.json();

      if (payload.code !== 0 || !payload.data?.play) {
        throw new Error(payload.msg || "Unable to fetch the video. Make sure the link is public.");
      }

      setVideoData(payload.data);
      setStatus("success");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unexpected error. Please try again later.");
      setStatus("error");
    }
  };

  const isLoading = status === "loading";

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-accent to-white text-ink">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-40 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-64 -right-32 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-48 w-full -translate-x-1/2 bg-primary/5 blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full rounded-3xl bg-background/80 p-8 shadow-glow backdrop-blur-xl md:p-12"
        >
          <div className="mb-10 space-y-4 text-center">
            <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
              Download TikTok Videos Without Watermark
            </p>
            <h1 className="text-3xl font-semibold sm:text-4xl md:text-5xl">
              Save your favorite TikTok videos in seconds
            </h1>
            <p className="mx-auto max-w-2xl text-base text-muted sm:text-lg">
              Paste any public TikTok link and instantly generate a download link without the watermark.
              No signup required.
            </p>
          </div>

          <form
            onSubmit={handleDownload}
            className="mx-auto flex w-full flex-col gap-4 md:flex-row"
          >
            <div className="relative w-full">
              <input
                className="w-full rounded-2xl border border-primary/20 bg-white/90 px-5 py-4 text-base text-ink shadow-sm outline-none transition focus:border-primary focus:shadow-primary/20 focus:shadow-lg"
                placeholder="https://www.tiktok.com/@username/video/1234567890"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                disabled={isLoading}
                aria-label="TikTok video URL"
              />
            </div>
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-base font-semibold text-white shadow-lg shadow-primary/30 transition focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                  Processing...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" aria-hidden="true" />
                  Download
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-6 min-h-[64px]">
            <AnimatePresence>
              {status === "error" && error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-2xl border border-red-100 bg-red-50/80 px-4 py-3 text-red-600"
                  role="alert"
                >
                  {error}
                </motion.div>
              )}

              {status === "success" && videoData && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ type: "spring", stiffness: 120, damping: 16 }}
                  className="grid gap-6 rounded-3xl border border-primary/10 bg-white/80 p-6 shadow-inner md:grid-cols-[240px,1fr]"
                >
                  <div className="relative overflow-hidden rounded-2xl bg-primary/5">
                    <img
                      src={videoData.cover}
                      alt={videoData.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col justify-between gap-4">
                    <div className="space-y-2">
                      <h2 className="text-xl font-semibold text-ink">{videoData.title}</h2>
                      <p className="text-sm font-medium text-muted">@{videoData.author.nickname}</p>
                    </div>
                    <motion.a
                      href={videoData.play}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-ink px-5 py-3 text-base font-semibold text-white shadow-lg shadow-ink/30 transition hover:bg-primary"
                    >
                      <Download className="h-5 w-5" aria-hidden="true" />
                      Download Now
                    </motion.a>
                  </div>
                </motion.div>
              )}

              {status === "loading" && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center justify-center gap-3 rounded-2xl bg-white/70 px-4 py-3 text-muted"
                >
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                  Fetching video details...
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-14 text-center text-sm text-muted"
        >
          ⚠️ Only public TikTok videos are supported. Video content remains hosted by TikTok.
        </motion.footer>
      </main>
    </div>
  );
}

export default App;
