import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  BookOpen,
  Clock,
} from "lucide-react";

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail?: string;
  subjectCode?: string;
  isEnrolled?: boolean;
  progress?: number;
}

interface RecentCoursesCarouselProps {
  courses: Course[];
  isLoading: boolean;
}

const RecentCoursesCarousel: React.FC<RecentCoursesCarouselProps> = ({
  courses,
  isLoading,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [courses, isLoading]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      // Delay check scroll to wait for animation
      setTimeout(checkScroll, 500);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-md p-8 border border-gray-300 shadow-sm animate-pulse flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-10 h-10 border-2 border-gray-100 border-t-blue-900 rounded-full animate-spin mb-4"></div>
        <p className="text-[12px] text-gray-400 font-bold uppercase tracking-widest">
          Synchronizing Curricular Media...
        </p>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="w-full bg-white rounded-md p-12 border border-blue-900/10 border-dashed text-center">
        <BookOpen className="w-12 h-12 text-blue-900/10 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">
          No active enrollments detected
        </h3>
        <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
          Visit the academic library to begin your curriculum path.
        </p>
        <Link
          to="/student/courses"
          className="inline-flex items-center gap-2 px-8 py-3 bg-blue-900 text-white rounded-sm text-[12px] font-bold uppercase tracking-widest hover:bg-blue-800 transition-colors shadow-sm"
        >
          Access Library
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-blue-900 text-white rounded-md shadow-[0_0_15px_rgba(30,58,138,0.2)]">
            <PlayCircle size={20} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Recent Learning Paths
            </h2>
            <p className="text-gray-600 text-[12px]  uppercase tracking-widest">
              Active Academic Streams
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={`p-2.5 rounded-full border border-gray-300 transition-all ${canScrollLeft ? "text-gray-700 hover:bg-gray-100 hover:border-blue-900 hover:text-blue-900 active:scale-95" : "text-gray-700 cursor-not-allowed"}`}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={`p-2.5 rounded-full border border-gray-300 transition-all ${canScrollRight ? "text-gray-700 hover:bg-gray-100 hover:border-blue-900 hover:text-blue-900 active:scale-95" : "text-gray-200 cursor-not-allowed"}`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-6 overflow-x-auto no-scrollbar pb-4 scroll-smooth snap-x"
      >
        {courses.map((course) => (
          <div
            key={course._id}
            className="min-w-[320px] max-w-[320px] flex-shrink-0 snap-start"
          >
            <Link
              to={`/student/course/${course._id}`}
              className="group bg-white rounded-md border border-gray-300 overflow-hidden flex flex-col h-full hover:border-blue-400 hover:shadow-xl transition-all duration-300"
            >
              <div className="aspect-[16/9] relative overflow-hidden bg-gray-50 border-b border-gray-100">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50">
                    <BookOpen size={48} className="text-gray-200 opacity-40" />
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className="px-2.5 py-1 bg-white/95 backdrop-blur-sm border border-gray-100 text-blue-900 text-[12px] rounded shadow-sm uppercase tracking-widest">
                    {course.subjectCode || "CORE"}
                  </span>
                </div>
                {course.isEnrolled && (
                  <div className="absolute bottom-4 right-4 bg-blue-900 text-white text-[10px] font-bold px-3 py-1.5 rounded shadow-lg flex items-center gap-1.5 border border-blue-800 animate-in fade-in duration-500">
                    <PlayCircle size={12} />
                    ACTIVE
                  </div>
                )}
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-1 group-hover:text-blue-900 transition-colors tracking-tight">
                  {course.title}
                </h3>
                <p className="text-gray-500 text-[13px] mb-2 line-clamp-2">
                  {course.description}
                </p>

                <div className="mt-auto space-y-4">
                  {course.isEnrolled && (
                    <div className="space-y-2">
                      <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                        <div
                          className="h-full bg-blue-900 rounded-full transition-all duration-1000 shadow-[2px_0_10px_rgba(30,58,138,0.2)]"
                          style={{ width: `${course.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex  items-center justify-between py-2 px-3 border border-gray-400">
                    <div className="flex items-center gap-2 text-gray-600">
                      {course.isEnrolled ? (
                        <>
                          <Clock
                            size={14}
                            className="group-hover:text-blue-900 transition-colors"
                          />
                          <span className="text-[14px]  uppercase tracking-widest">
                            Resume Module
                          </span>
                        </>
                      ) : (
                        <>
                          <BookOpen
                            size={14}
                            className="group-hover:text-blue-900 transition-colors"
                          />
                          <span className="text-[14px] uppercase tracking-widest">
                            View Details
                          </span>
                        </>
                      )}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 text-gray-400 group-hover:bg-blue-900 group-hover:text-white group-hover:border-blue-900 transition-all duration-300 ring-4 ring-transparent group-hover:ring-blue-50">
                      <ChevronRight
                        size={18}
                        className="group-hover:translate-x-0.5 transition-transform"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default RecentCoursesCarousel;
