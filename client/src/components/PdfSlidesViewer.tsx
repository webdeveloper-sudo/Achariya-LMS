import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

// Configure worker locally using unpkg to avoid build issues with Vite for now
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfSlidesViewerProps {
  url: string;
}

const PdfSlidesViewer: React.FC<PdfSlidesViewerProps> = ({ url }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  }

  function onDocumentLoadError(err: Error) {
    console.error("PDF Load Error:", err);
    setLoading(false);
    setError("Failed to load PDF slides.");
  }

  return (
    <div className="flex flex-col bg-gray-100 rounded-xl overflow-hidden border w-full h-[600px]">
      <div className="flex-1 relative bg-gray-200 overflow-hidden flex items-center justify-center p-4">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-100/80">
            <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
            <span className="ml-2 text-gray-600 font-medium">
              Loading Slides...
            </span>
          </div>
        )}

        {error ? (
          <div className="text-center">
            <p className="text-red-500 font-medium mb-2">{error}</p>
            <a href={url} download className="text-blue-600 underline text-sm">
              Download instead
            </a>
          </div>
        ) : (
          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            className="shadow-lg"
            loading={null}
          >
            <Page
              pageNumber={pageNumber}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              height={500}
              className="max-w-full"
            />
          </Document>
        )}
      </div>

      {/* Controls */}
      {!loading && !error && numPages > 0 && (
        <div className="bg-white p-3 border-t w-full flex items-center justify-between px-6">
          <span className="text-sm font-medium text-gray-700">
            Slide {pageNumber} of {numPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
              disabled={pageNumber <= 1}
              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 text-gray-700 transition"
              title="Previous Slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
              disabled={pageNumber >= numPages}
              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 text-gray-700 transition"
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

export default PdfSlidesViewer;
