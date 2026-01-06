import { Trophy, TrendingUp, Award, Users } from 'lucide-react';
import { sampleData } from '../../data/sampleData';
import { useState } from 'react';
import BackButton from '../../components/BackButton';

const StudentLeaderboard = () => {
    const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'alltime'>('weekly');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const currentStudent = sampleData.students.find(s => s.email === user.email) || sampleData.students[0];

    // Mock leaderboard data
    const dailyLeaders = [
        { rank: 1, name: 'Rahul Patel', class: '12 Science', points: 25, streak: 23, avatar: '🏆' },
        { rank: 2, name: 'Aisha Khan', class: '10-A', points: 22, streak: 8, avatar: '⭐' },
        { rank: 3, name: 'Vikram Joshi', class: 'CS Year 2', points: 20, streak: 10, avatar: '🎯' },
        { rank: 4, name: 'Karthik Balan', class: 'CS Year 3', points: 18, streak: 7, avatar: '🚀' },
        { rank: 5, name: 'Divya Menon', class: '10-B', points: 15, streak: 15, avatar: '💎' },
        { rank: 6, name: currentStudent.name, class: currentStudent.class, points: 12, streak: 5, avatar: '🎓', isYou: true }
    ];

    const weeklyLeaders = [
        { rank: 1, name: 'Rahul Patel', class: '12 Science', quizzes: 12, avg: 98, avatar: '👑' },
        { rank: 2, name: 'Divya Menon', class: '10-B', quizzes: 10, avg: 95, avatar: '🌟' },
        { rank: 3, name: 'Aisha Khan', class: '10-A', quizzes: 11, avg: 93, avatar: '💫' },
        { rank: 4, name: 'Vikram Joshi', class: 'CS Year 2', quizzes: 9, avg: 92, avatar: '⚡' },
        { rank: 5, name: 'Karthik Balan', class: 'CS Year 3', quizzes: 8, avg: 90, avatar: '🔥' },
        { rank: 8, name: currentStudent.name, class: currentStudent.class, quizzes: 6, avg: 88, avatar: '📚', isYou: true }
    ];

    const alltimeLeaders = [
        { rank: 1, name: 'Rahul Patel', class: '12 Science', badges: 5, credits: 865, completion: 95, avatar: '🏅' },
        { rank: 2, name: 'Aisha Khan', class: '10-A', badges: 4, credits: 755, completion: 92, avatar: '🎖️' },
        { rank: 3, name: 'Karthik Balan', class: 'CS Year 3', badges: 5, credits: 658, completion: 93, avatar: '🏵️' },
        { rank: 4, name: 'Divya Menon', class: '10-B', badges: 3, credits: 542, completion: 88, avatar: '🌺' },
        { rank: 5, name: 'Vikram Joshi', class: 'CS Year 2', badges: 4, credits: 520, completion: 90, avatar: '⚜️' },
        { rank: 12, name: currentStudent.name, class: currentStudent.class, badges: 3, credits: 245, completion: 85, avatar: '🎗️', isYou: true }
    ];

    const renderLeaderboard = () => {
        let leaders: any = dailyLeaders;
        if (activeTab === 'weekly') leaders = weeklyLeaders;
        if (activeTab === 'alltime') leaders = alltimeLeaders;

        return leaders.map((leader: any) => (
            <div key={leader.rank} className={`flex items-center justify-between p-4 rounded-xl transition ${leader.isYou
                ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-500'
                : 'bg-white border border-gray-200 hover:shadow-md'
                }`}>
                <div className="flex items-center gap-4">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-xl ${leader.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                        leader.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
                            leader.rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                                'bg-gray-100 text-gray-600'
                        }`}>
                        {leader.rank <= 3 ? leader.avatar : `#${leader.rank}`}
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-bold text-gray-800">
                                {leader.name}
                                {leader.isYou && <span className="text-blue-600 text-sm ml-2">(You)</span>}
                            </p>
                        </div>
                        <p className="text-sm text-gray-600">{leader.class}</p>
                    </div>
                </div>

                <div className="text-right">
                    {activeTab === 'daily' && (
                        <>
                            <p className="text-2xl font-bold text-blue-600">{leader.points} pts</p>
                            <p className="text-xs text-gray-600">{leader.streak}🔥 streak</p>
                        </>
                    )}
                    {activeTab === 'weekly' && (
                        <>
                            <p className="text-2xl font-bold text-green-600">{leader.avg}%</p>
                            <p className="text-xs text-gray-600">{leader.quizzes} quizzes</p>
                        </>
                    )}
                    {activeTab === 'alltime' && (
                        <>
                            <p className="text-2xl font-bold text-purple-600">{leader.credits} ⭐</p>
                            <p className="text-xs text-gray-600">{leader.badges} badges • {leader.completion}%</p>
                        </>
                    )}
                </div>
            </div>
        ));
    };

    return (
        <div>
            <BackButton />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Leaderboards</h1>
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl">
                    <p className="text-sm">Your Best Rank</p>
                    <p className="text-2xl font-bold">#8</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('daily')}
                    className={`flex-1 px-6 py-3 rounded-xl font-semibold transition ${activeTab === 'daily'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-blue-300'
                        }`}
                >
                    <TrendingUp className="w-5 h-5 inline mr-2" />
                    Daily
                </button>
                <button
                    onClick={() => setActiveTab('weekly')}
                    className={`flex-1 px-6 py-3 rounded-xl font-semibold transition ${activeTab === 'weekly'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-blue-300'
                        }`}
                >
                    <Trophy className="w-5 h-5 inline mr-2" />
                    Weekly
                </button>
                <button
                    onClick={() => setActiveTab('alltime')}
                    className={`flex-1 px-6 py-3 rounded-xl font-semibold transition ${activeTab === 'alltime'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-blue-300'
                        }`}
                >
                    <Award className="w-5 h-5 inline mr-2" />
                    All-Time
                </button>
            </div>

            {/* Info Banner */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4 mb-6">
                <p className="text-amber-900 font-semibold">
                    {activeTab === 'daily' && '🏆 Daily leaderboard resets every 24 hours - race to the top!'}
                    {activeTab === 'weekly' && '📊 Weekly leaderboard: Top performers by quiz scores this week'}
                    {activeTab === 'alltime' && '👑 Hall of Fame: Lifetime achievement leaders'}
                </p>
            </div>

            {/* Leaderboard */}
            <div className="space-y-3">
                {renderLeaderboard()}
            </div>

            {/* Class vs Class Section */}
            <div className="mt-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Users className="w-6 h-6" />
                    Class vs Class
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 text-center">
                        <p className="text-3xl mb-2">🥇</p>
                        <p className="font-bold text-gray-800">12 Science</p>
                        <p className="text-2xl font-bold text-yellow-600">94%</p>
                        <p className="text-xs text-gray-600">Avg Completion</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                        <p className="text-3xl mb-2">🥈</p>
                        <p className="font-bold text-gray-800">CS Year 3</p>
                        <p className="text-2xl font-bold text-gray-500">91%</p>
                        <p className="text-xs text-gray-600">Avg Completion</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                        <p className="text-3xl mb-2">🥉</p>
                        <p className="font-bold text-gray-800">10-A</p>
                        <p className="text-2xl font-bold text-orange-600">89%</p>
                        <p className="text-xs text-gray-600">Avg Completion</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentLeaderboard;
