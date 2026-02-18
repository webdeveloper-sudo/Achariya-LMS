import { Link } from "react-router-dom";
import { ArrowLeft, Wallet } from "lucide-react";
import { useState, useEffect } from "react";
import { studentApi } from "../../api";

const StudentWalletPage = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await studentApi.getWallet();
        if (res.data) {
          setBalance(res.data.balance || 0);
          setTransactions(res.data.history || []);
        }
      } catch (error) {
        console.error("Failed to fetch wallet:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <Link
        to="/student/dashboard"
        className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Wallet</h1>
        <div className="bg-purple-100 p-2 rounded-full">
          <Wallet className="w-6 h-6 text-purple-600" />
        </div>
      </div>

      {/* Current Balance */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl shadow-lg p-8 text-white mb-8 transform transition-all hover:scale-[1.01]">
        <div className="flex flex-col items-center justify-center text-center">
          <p className="text-purple-200 text-lg font-medium mb-2">
            Current Balance
          </p>
          {loading ? (
            <div className="h-12 w-32 bg-purple-500/50 animate-pulse rounded"></div>
          ) : (
            <p className="text-6xl font-bold mb-4 tracking-tight">{balance}</p>
          )}
          <span className="bg-purple-500/30 px-4 py-1 rounded-full text-sm font-medium border border-purple-400/30">
            Credits Available
          </span>
          <p className="text-sm text-purple-200 mt-6 max-w-sm">
            Earn credits by completing modules, acing quizzes, and maintaining
            your daily streak!
          </p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800">
            Transaction History
          </h2>
        </div>

        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading history...
            </div>
          ) : transactions.length > 0 ? (
            transactions.map((txn) => (
              <div
                key={txn._id || txn.id}
                className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 pr-4">
                  <p className="font-semibold text-gray-800 text-lg">
                    {txn.message || txn.desc}
                  </p>
                  <div className="flex items-center mt-1 space-x-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full uppercase font-medium tracking-wide ${
                        txn.amount > 0
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {txn.type || "General"}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(txn.timestamp || txn.date).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </span>
                  </div>
                </div>
                <div
                  className={`text-right font-bold text-xl ${
                    txn.amount > 0 ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {txn.amount > 0 ? "+" : ""}
                  {txn.amount}
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <div className="inline-block p-4 rounded-full bg-gray-100 mb-4">
                <Wallet className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">No transactions yet.</p>
              <p className="text-gray-400 text-sm mt-1">
                Start learning to earn your first credits!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentWalletPage;
