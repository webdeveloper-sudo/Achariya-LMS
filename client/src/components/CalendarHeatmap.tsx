import React, { useState, useMemo, useEffect, useRef } from "react";

/**
 * CUSTOM GITHUB-STYLE HEATMAP BY MONTH
 * - Each month starts in a new column
 * - Separation between months
 * - Perfectly aligned grid
 * - Today centered
 */

interface HeatmapDataPoint {
  date: string;
  count: number;
}

interface HeatmapProps {
  data?: Array<HeatmapDataPoint>;
  onDateClick?: (date: string, count: number) => void;
}

// --- MOCK DATA GENERATOR (1 Year centered) ---
const generateMockData = (): HeatmapDataPoint[] => {
  const data: HeatmapDataPoint[] = [];
  const today = new Date();
  // Generate data for 6 months back and 6 months forward
  for (let i = -180; i <= 180; i++) {
    const d = new Date();
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];

    // Patterns: most active mid-week, less on weekends
    const day = d.getDay();
    let count = 0;
    if (day !== 0 && day !== 6) {
      count = Math.random() > 0.3 ? Math.floor(Math.random() * 10) : 0;
    } else {
      count = Math.random() > 0.8 ? Math.floor(Math.random() * 3) : 0;
    }

    data.push({ date: dateStr, count });
  }
  return data;
};

const CalendarHeatmapComponent: React.FC<HeatmapProps> = ({
  data: externalData,
  onDateClick,
}) => {
  const [hoveredDate, setHoveredDate] = useState<any>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const heatmapData = useMemo(() => {
    const raw = externalData || generateMockData();
    const map: Record<string, number> = {};
    raw.forEach((d) => {
      map[d.date] = d.count;
    });
    return map;
  }, [externalData]);

  // Generate 12 months range (today centered)
  const months = useMemo(() => {
    const today = new Date();
    const list = [];
    // Start from 6 months ago to 6 months ahead
    for (let i = -6; i <= 6; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();

      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const monthDays = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const dateObj = new Date(year, month, day);
        monthDays.push(dateObj);
      }

      list.push({
        name: d.toLocaleString("default", { month: "short" }),
        year,
        days: monthDays,
      });
    }
    return list;
  }, []);

  // Auto-scroll to center (approximately)
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      container.scrollLeft =
        (container.scrollWidth - container.clientWidth) / 2;
    }
  }, []);

  // Intensity Mapping (Using user's provided colors)
  const getIntensityClass = (count: number) => {
    if (!count || count === 0) return "bg-[#ebedf0]";
    if (count < 2) return "bg-[rgba(181,197,243,1)]";
    if (count < 4) return "bg-[#1E3A8A]";
    if (count < 6) return "bg-[#1e3b8a98]";
    return "bg-[#1E3A8A]";
  };

  const dayLabels = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];

  return (
    <div className="w-full bg-white border border-gray-300 rounded-lg p-6 shadow-sm font-sans relative heatmap-industrial">
      <div className="flex">
        {/* Y-Axis Labels (Sun-Sat) */}
        <div className="flex flex-col justify-between pt-[22px] pb-[4px] h-[115px] pr-3 border-r border-gray-100">
          {dayLabels.map((label) => (
            <span
              key={label}
              className="text-[13px] text-gray-400 mb-3.5 font-medium h-[12px] flex items-center"
            >
              {label}
            </span>
          ))}
        </div>

        {/* Scalable Scrollable Heatmap */}
        <div
          ref={containerRef}
          className="heatmap-container flex-1 overflow-x-auto overflow-y-hidden no-scrollbar flex items-start pl-4"
        >
          {months.map((month, mIdx) => (
            <div
              key={`${month.name}-${mIdx}`}
              className="flex flex-col mr-4 last:mr-0 group"
            >
              {/* Month Label */}
              <span className="text-[13px] text-gray-600 font-semibold mb-2 uppercase tracking-tight mx-auto">
                {month.name}
              </span>

              {/* Month Grid (Columns are weeks) */}
              <div className="flex gap-[4px]">
                {/* Group days into week columns */}
                {(() => {
                  const dayOffset = month.days[0].getDay(); // 0 (Sun) - 6 (Sat)
                  const columns: JSX.Element[] = [];
                  let currentWeek: JSX.Element[] = [];

                  // Fill the first week's prefix with empty placeholders if requested,
                  // but "Start month from new column" usually means the first column is the first week.
                  // Pad start of first week
                  for (let i = 0; i < dayOffset; i++) {
                    currentWeek.push(
                      <div key={`pad-${i}`} className="w-3 h-3" />,
                    );
                  }

                  month.days.forEach((date, dIdx) => {
                    const dateStr = date.toISOString().split("T")[0];
                    const count = heatmapData[dateStr] || 0;
                    const isToday =
                      dateStr === new Date().toISOString().split("T")[0];

                    currentWeek.push(
                      <div
                        key={dateStr}
                        className={`w-5 h-5 rounded-[2px] cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-blue-200 ${getIntensityClass(count)} ${isToday ? "ring-2 ring-blue-500" : ""}`}
                        onMouseOver={(e) => {
                          const rect = (
                            e.target as HTMLElement
                          ).getBoundingClientRect();
                          setHoveredDate({ date: dateStr, count });
                          setTooltipPos({
                            x: rect.left + rect.width / 2,
                            y: rect.top - 10,
                          });
                        }}
                        onMouseLeave={() => setHoveredDate(null)}
                        onClick={() => onDateClick?.(dateStr, count)}
                      />,
                    );

                    // End of week (Sat) or end of month
                    if (date.getDay() === 6 || dIdx === month.days.length - 1) {
                      // Pad end of last week if needed
                      if (dIdx === month.days.length - 1) {
                        for (let i = date.getDay(); i < 6; i++) {
                          currentWeek.push(
                            <div key={`pad-end-${i}`} className="w-3 h-3" />,
                          );
                        }
                      }

                      columns.push(
                        <div
                          key={`col-${columns.length}`}
                          className="flex flex-col gap-[4px]"
                        >
                          {currentWeek}
                        </div>,
                      );
                      currentWeek = [];
                    }
                  });
                  return columns;
                })()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer / Legend */}
      <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-end text-[11px] text-gray-500">
        {/* <a
          href="#"
          className="text-blue-600 hover:underline"
          onClick={(e) => e.preventDefault()}
        >
          Learn how we count contributions.
        </a> */}
        <div className="flex items-center gap-3">
          <span>Less</span>
          <div className="flex gap-[4px]">
            <div className="w-3 h-3 bg-[#ebedf0] rounded-sm" />
            <div className="w-3 h-3 bg-[rgba(181,197,243,1)] rounded-sm" />
            <div className="w-3 h-3 bg-[#1e3b8a98] rounded-sm" />
            <div className="w-3 h-3 bg-[#1E3A8A] rounded-sm" />
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Improved Tooltip */}
      {hoveredDate && (
        <div
          className="fixed z-[100] transform -translate-x-1/2 -translate-y-full px-3 py-2 bg-gray-900 text-white text-[11px] rounded shadow-lg pointer-events-none flex flex-col items-center"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <div className="font-bold whitespace-nowrap">
            {hoveredDate.count} activities on{" "}
            {new Date(hoveredDate.date).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-900"></div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default CalendarHeatmapComponent;
