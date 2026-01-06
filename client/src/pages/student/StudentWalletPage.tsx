import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { sampleData } from '../../data/sampleData';

const StudentWalletPage = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const student = sampleData.students.find(s => s.email === user.email) || sampleData.students[0];

    // Sample transactions
    const transactions = [
        { id: 1, date: '2025-12-05', desc: 'Quiz completion - Advanced Math Module 1', amount: 15, type: 'credit' },
        { id: 2, date: '2025-12-04', desc: 'Quiz completion - Physics Module 1', amount: 10, type: 'credit' },
        { id: 3, date: '2025-12-03', desc: 'Module completion bonus', amount: 5, type: 'credit' },
        { id: 4, date: '2025-12-02', desc: 'Quiz completion - Advanced Math Module 2', amount: 15, type: 'credit' }
    ];

    return (
        <div>
            <Link to="/student/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Link>

            <h1 className="text-3xl font-bold text-gray-800 mb-6">My Wallet</h1>

            {/* Current Balance */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl shadow-lg p-8 text-white mb-8">
                <p className="text-lg opacity-90 mb-2">Current Balance</p>
                <p className="text-5xl font-bold mb-4">{student.credits} Credits</p>
                <p className="text-sm opacity-75">Keep learning to earn more credits!</p>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-xl shadow-sm p-6 border">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Transaction History</h2>
                <div className="space-y-3">
                    {transactions.map((txn) => (
                        <div key={txn.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                                <p className="font-semibold text-gray-800">{txn.desc}</p>
                                <p className="text-sm text-gray-500">{txn.date}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-green-600">+{txn.amount}</p>
                                <p className="text-xs text-gray-500">Credits</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StudentWalletPage;
