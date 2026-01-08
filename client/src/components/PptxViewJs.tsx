import React, { useEffect, useRef, useState } from "react";
import { PPTXViewer } from "pptxviewjs";
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import "chart.js/auto"; // Required if presentations have charts

interface PptxViewJsProps {
  url: string;
  className?: string;
}

const PptxViewJs: React.FC<PptxViewJsProps> = ({
  url,
  className = "w-full h-[600px]",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewerRef = useRef<any>(null); // PPTXViewer instance
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slideInfo, setSlideInfo] = useState({ current: 1, total: 0 });

  // Ensure we have a full URL (similar to before, good practice)
  const getFullUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${window.location.origin}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  const fullUrl = getFullUrl(url);

  useEffect(() => {
    let mounted = true;

    const initViewer = async () => {
      if (!canvasRef.current || !fullUrl) return;

      try {
        setLoading(true);
        setError(null);

        // Initialize viewer
        if (!viewerRef.current) {
          viewerRef.current = new PPTXViewer({
            canvas: canvasRef.current,
          });
        }

        const viewer = viewerRef.current;

        // Load the file
        // Fetch blob first to be robust (handles local server auth/cookies potentially)
        const response = await fetch(fullUrl);
        if (!response.ok)
          throw new Error(`Failed to fetch PPTX: ${response.statusText}`);
        const blob = await response.blob();

        // pptxviewjs expects File object or similar
        const file = new File([blob], "presentation.pptx");

        if (!mounted) return;

        await viewer.loadFile(file);
        await viewer.render(); // Render first slide

        if (mounted) {
          setSlideInfo({
            current: 1,
            total: viewer.getSlideCount(),
          });
          setLoading(false);
        }
      } catch (err: any) {
        console.error("PPTX Load Error:", err);
        if (mounted) {
          setError(err.message || "Failed to load presentation.");
          setLoading(false);
        }
      }
    };

    initViewer();

    return () => {
      mounted = false;
      // Cleanup if library supports it?
    };
  }, [fullUrl]);

  const handleNext = async () => {
    if (viewerRef.current) {
      await viewerRef.current.nextSlide();
      setSlideInfo((prev) => ({
        ...prev,
        current: viewerRef.current.getCurrentSlideIndex(),
      }));
    }
  };

  const handlePrev = async () => {
    if (viewerRef.current) {
      await viewerRef.current.prevSlide();
      setSlideInfo((prev) => ({
        ...prev,
        current: viewerRef.current.getCurrentSlideIndex(),
      }));
    }
  };

  return (
    <div
      className={`flex flex-col bg-gray-100 rounded-xl overflow-hidden border ${className}`}
    >
      {/* Viewer Area */}
      <div className="flex-1 relative bg-gray-200 overflow-auto flex items-center justify-center p-4">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
            <span className="ml-2 text-gray-600">Loading Slides...</span>
          </div>
        )}

        {error ? (
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
            <p className="text-red-600 font-medium mb-1">Preview Error</p>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <a
              href={fullUrl}
              download
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Download File
            </a>
          </div>
        ) : (
          <canvas ref={canvasRef} className="max-w-full max-h-full shadow-lg" />
        )}
      </div>

      {/* Controls */}
      {!loading && !error && slideInfo.total > 0 && (
        <div className="bg-white p-3 border-t flex items-center justify-between">
          <div className="text-sm text-gray-600 font-medium">
            Slide {slideInfo.current} / {slideInfo.total}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handlePrev}
              disabled={slideInfo.current <= 1}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 transition"
              title="Previous Slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              disabled={slideInfo.current >= slideInfo.total}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 transition"
              title="Next Slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PptxViewJs;
