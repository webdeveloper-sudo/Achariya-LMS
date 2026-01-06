import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker - use local file instead of CDN
if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

interface SlideBySlideViewerProps {
    pdfUrl: string;
}

const SlideBySlideViewer = ({ pdfUrl }: SlideBySlideViewerProps) => {
    const [numPages, setNumPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pdfDocRef = useRef<any>(null);

    useEffect(() => {
        loadPdf();
    }, [pdfUrl]);

    useEffect(() => {
        if (pdfDocRef.current && currentPage) {
            renderPage(currentPage);
        }
    }, [currentPage]);

    const loadPdf = async () => {
        setLoading(true);
        setError(null);
        try {
            // Encode URL to handle special characters like & and spaces
            const encodedUrl = encodeURI(pdfUrl);
            console.log('Loading PDF from:', encodedUrl);
            console.log('Original URL:', pdfUrl);

            // Use fetch to load PDF as ArrayBuffer (better for local files)
            const response = await fetch(encodedUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const arrayBuffer = await response.arrayBuffer();

            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;
            pdfDocRef.current = pdf;
            setNumPages(pdf.numPages);
            setCurrentPage(1);
            console.log(`PDF loaded successfully. Total pages: ${pdf.numPages}`);
            await renderPage(1);
        } catch (error: any) {
            console.error('Error loading PDF:', error);
            console.error('Error details:', error.message);
            setError(`Failed to load presentation: ${error.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const renderPage = async (pageNum: number) => {
        if (!pdfDocRef.current || !canvasRef.current) return;

        try {
            const page = await pdfDocRef.current.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1.5 });

            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
                canvasContext: context!,
                viewport: viewport
            };

            await page.render(renderContext).promise;
        } catch (error) {
            console.error('Error rendering page:', error);
        }
    };

    const goToPrevious = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const goToNext = () => {
        if (currentPage < numPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    if (error) {
        return (
            <div className="flex items-center justify-center h-[600px] bg-red-50 rounded-lg border-2 border-red-200">
                <div className="text-center p-8">
                    <div className="text-red-600 text-6xl mb-4">⚠️</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Failed to Load Slides</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <p className="text-sm text-gray-500">Make sure the PDF file exists and is accessible.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[600px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading slides...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Canvas for PDF rendering */}
            <div className="bg-white rounded-lg shadow-lg p-4 flex items-center justify-center overflow-auto">
                <canvas
                    ref={canvasRef}
                    className="max-w-full h-auto"
                />
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
                <button
                    onClick={goToPrevious}
                    disabled={currentPage === 1}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Previous
                </button>

                <span className="text-gray-700 font-semibold">
                    Slide {currentPage} of {numPages}
                </span>

                <button
                    onClick={goToNext}
                    disabled={currentPage === numPages}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                    <ChevronRight className="w-5 h-5 ml-2" />
                </button>
            </div>

            <p className="text-sm text-gray-500 text-center">
                📊 Navigate slide by slide using the controls above
            </p>
        </div>
    );
};

export default SlideBySlideViewer;
