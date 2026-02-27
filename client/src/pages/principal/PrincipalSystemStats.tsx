import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Server,
  Database,
  Activity,
  HardDrive,
  Cpu,
  Users,
  Zap,
  ShieldCheck,
  BarChart3,
} from "lucide-react";

const PrincipalSystemStats = () => {
  const stats = {
    serverHealth: 98,
    databaseSize: 2.4,
    activeUsers: 247,
    totalRequests: 15420,
    avgResponseTime: 245,
    uptime: 99.9,
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="border-b border-gray-100 pb-12">
        <Link
          to="/principal/dashboard"
          className="inline-flex items-center text-[13px] hover:text-[#008000] mb-10 transition-colors capitalize"
          style={{ color: "#008000" }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Executive Dashboard
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 text-center sm:text-left">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-6 justify-center sm:justify-start">
              <div className="bg-green-50 p-2 rounded border border-green-100">
                <ShieldCheck className="w-5 h-5" style={{ color: "#008000" }} />
              </div>
              <span
                className="text-[13px] capitalize"
                style={{ color: "#008000" }}
              >
                Infrastructure Status
              </span>
            </div>
            <h1 className="text-4xl text-gray-900 mb-6 leading-tight capitalize">
              System <span className="text-gray-400">Telemetry</span>
            </h1>
            <p className="text-gray-600 text-[15px] max-w-xl leading-relaxed mx-auto sm:mx-0">
              Real-time diagnostics of institutional digital assets. Monitoring
              server elasticity, database integrity, and participant traffic
              logs.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 justify-center sm:justify-start lg:mx-0 mx-auto">
            <div className="flex items-center gap-3 px-6 py-4 bg-green-50 text-[#008000] rounded-md border border-green-100 animate-pulse">
              <Activity size={18} />
              <div className="text-left">
                <p className="text-[11px] font-bold capitalize">
                  Systems Operational
                </p>
                <p className="text-[10px] opacity-70 capitalize">
                  Zero Critical Anomalies Detected
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Infrastructure Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          {
            label: "Server Elasticity",
            val: `${stats.serverHealth}%`,
            icon: Server,
            detail: "Core Systems Active",
          },
          {
            label: "Storage Capacity",
            val: `${stats.databaseSize} GB`,
            icon: Database,
            detail: "PostgreSQL Engine",
          },
          {
            label: "Concurrent Sessions",
            val: stats.activeUsers,
            icon: Users,
            detail: "Verified Traces (24h)",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="group bg-white rounded-md p-8 border border-gray-100 shadow-sm transition-all text-center sm:text-left"
          >
            <div className="bg-gray-50 text-gray-400 w-12 h-12 rounded flex items-center justify-center mb-6 mx-auto sm:mx-0 group-hover:bg-green-50 group-hover:text-[#008000] transition-colors">
              <stat.icon size={22} />
            </div>
            <p className="text-[11px] text-gray-400 capitalize mb-2 font-medium">
              {stat.label}
            </p>
            <p className="text-4xl text-gray-900 tracking-tight tabular-nums">
              {stat.val}
            </p>
            <p className="text-[10px] text-gray-400 capitalize mt-4 font-mono">
              {stat.detail}
            </p>
          </div>
        ))}
      </div>

      {/* Deep Performance Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-md border border-gray-100 shadow-sm p-8">
          <div className="flex items-center gap-4 mb-10">
            <div
              className="bg-green-50 p-2.5 rounded border border-green-100"
              style={{ color: "#008000" }}
            >
              <BarChart3 size={20} />
            </div>
            <div>
              <h2 className="text-xl text-gray-900 capitalize">
                Performance Indices
              </h2>
              <p className="text-gray-400 text-[11px] capitalize mt-1">
                Operational Latency & Uptime Traces
              </p>
            </div>
          </div>

          <div className="space-y-10">
            {[
              {
                label: "Average Response Latency",
                val: `${stats.avgResponseTime}ms`,
                pct: 80,
                detail: "Optimal Threshold",
              },
              {
                label: "Full-Cycle System Uptime",
                val: `${stats.uptime}%`,
                pct: 99.9,
                detail: "Standard Integrity",
              },
              {
                label: "API Engagement (24h)",
                val: stats.totalRequests.toLocaleString(),
                pct: 65,
                color: "bg-gray-900",
              },
            ].map((metric, i) => (
              <div key={i} className="group">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-[13px] text-gray-600 capitalize group-hover:text-gray-900 transition-colors">
                    {metric.label}
                  </p>
                  <span className="text-[13px] font-medium text-gray-900 tabular-nums">
                    {metric.val}
                  </span>
                </div>
                <div className="w-full bg-gray-50 rounded-full h-1 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${metric.color || ""}`}
                    style={{
                      width: `${metric.pct}%`,
                      backgroundColor: metric.color ? "" : "#008000",
                    }}
                  />
                </div>
                <p className="text-[10px] text-gray-400 capitalize mt-2 text-right">
                  {metric.detail}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-md border border-gray-100 shadow-sm p-8">
          <div className="flex items-center gap-4 mb-10">
            <div
              className="bg-green-50 p-2.5 rounded border border-green-100"
              style={{ color: "#008000" }}
            >
              <Zap size={20} />
            </div>
            <div>
              <h2 className="text-xl text-gray-900 capitalize">
                Hardware Allocation
              </h2>
              <p className="text-gray-400 text-[11px] capitalize mt-1">
                Resource Utilization Parameters
              </p>
            </div>
          </div>

          <div className="space-y-10">
            {[
              { label: "Core Processing Load", val: "42%", pct: 42, icon: Cpu },
              {
                label: "Volatile Memory Usage",
                val: "6.2 / 16 GB",
                pct: 39,
                icon: HardDrive,
              },
              {
                label: "Fixed Storage Volume",
                val: "12.4 / 50 GB",
                pct: 25,
                icon: Database,
              },
            ].map((resource, i) => (
              <div key={i} className="group">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <resource.icon size={14} className="text-gray-300" />
                    <p className="text-[13px] text-gray-600 capitalize group-hover:text-gray-900 transition-colors">
                      {resource.label}
                    </p>
                  </div>
                  <span className="text-[13px] font-medium text-gray-900 tabular-nums">
                    {resource.val}
                  </span>
                </div>
                <div className="w-full bg-gray-50 rounded-full h-1 overflow-hidden">
                  <div
                    className="h-full transition-all duration-1000"
                    style={{
                      width: `${resource.pct}%`,
                      backgroundColor: "#008000",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Info Breakdown */}
      <div className="bg-white rounded-md border border-gray-100 shadow-sm p-8">
        <div className="flex items-center gap-4 mb-10">
          <div className="bg-gray-900 p-2.5 rounded border border-gray-100 text-white">
            <Server size={20} />
          </div>
          <div>
            <h2 className="text-xl text-gray-900 capitalize">
              Architecture Specifications
            </h2>
            <p className="text-gray-400 text-[11px] capitalize mt-1">
              System Version & Deployment Traces
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: "Processing Logic", val: "FastAPI 0.104.1" },
            { label: "Terminal Interface", val: "React 18.2.0" },
            { label: "Data Persistence", val: "PostgreSQL 14.5" },
            { label: "Hosting Cluster", val: "AWS Elastic Cloud" },
          ].map((spec, i) => (
            <div
              key={i}
              className="p-6 bg-gray-50 rounded border border-gray-100 transition-colors hover:bg-white hover:border-gray-200"
            >
              <p className="text-[10px] text-gray-400 capitalize mb-2">
                {spec.label}
              </p>
              <p className="text-sm font-medium text-gray-900 capitalize">
                {spec.val}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrincipalSystemStats;
