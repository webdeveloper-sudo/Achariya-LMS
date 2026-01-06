import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, ArrowUpDown } from 'lucide-react';
import { getCourses, createCourse, deleteCourse, updateCourseStatus, updateCourse } from "@/services/courseService.js";
import { createModule } from "@/services/moduleService.js";
import CourseModal from './components/CourseModal';
import ConfirmDialog from './components/ConfirmDialog';
import StatusBadge from './components/StatusBadge';
import LoadingSpinner from './components/LoadingSpinner';
import Pagination from './components/Pagination';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CoursesDashboard = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        status: 'All',
        grade: 'All',
        school: ''
    });
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null); // For editing
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        fetchCourses();
    }, [page, filters]);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const data = await getCourses(page, filters);
            if (data.success) {
                setCourses(data.data);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load courses");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCourse = async (data) => {
        try {
             const { initialModule, ...courseDetails } = data;
             const res = await createCourse(courseDetails);
             
             if (res.success) {
                  toast.success("Course created successfully");
                  fetchCourses();
             }
        } catch (error) {
             console.error(error);
             toast.error("Failed to create course");
             throw error; 
        }
    };

    const handleDeleteCourse = async () => {
        if (!deleteId) return;
        try {
            await deleteCourse(deleteId);
            toast.success("Course deleted");
            fetchCourses();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete course");
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <ToastContainer />
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                     <h1 className="text-3xl font-bold text-gray-800">Course Management</h1>
                     <p className="text-gray-500">Manage all courses across 35+ schools</p>
                </div>
                <button 
                    onClick={() => { setSelectedCourse(null); setIsCourseModalOpen(true); }}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Create New Course
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-wrap gap-4 items-center border">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                        type="text" 
                        placeholder="Search courses..." 
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
                    />
                </div>
                
                <select 
                    className="px-4 py-2 border rounded-lg bg-gray-50 hover:bg-white cursor-pointer"
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({...prev, status: e.target.value}))}
                >
                    <option value="All">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                </select>

                <select 
                     className="px-4 py-2 border rounded-lg bg-gray-50 hover:bg-white cursor-pointer"
                     value={filters.grade}
                     onChange={(e) => setFilters(prev => ({...prev, grade: e.target.value}))}
                >
                    <option value="All">All Grades</option>
                    {Array.from({ length: 12 }, (_, i) => <option key={i} value={`Grade ${i+1}`}>Grade {i+1}</option>)}
                </select>
            </div>

            {/* Grid */}
            {loading ? (
                 <div className="flex justify-center py-20"><LoadingSpinner size="large" /></div>
            ) : courses.length === 0 ? (
                 <div className="text-center py-20 bg-white rounded-xl border border-dashed">
                     <p className="text-gray-500 text-lg">No courses found</p>
                     <button onClick={() => setIsCourseModalOpen(true)} className="text-blue-600 mt-2 font-medium">Create your first course</button>
                 </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(course => (
                        <div key={course._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border flex flex-col h-full">
                            <div className="h-40 bg-gray-100 rounded-t-xl overflow-hidden relative group">
                                {course.thumbnail ? (
                                    <img 
                                        src={course.thumbnail.startsWith('http') ? course.thumbnail : `${(import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/api\/v1$|\/api$/, '')}${course.thumbnail.startsWith('/') ? '' : '/'}${course.thumbnail}`} 
                                        alt={course.title} 
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.children[1].style.display = 'flex'; }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                         <span className="text-4xl">📚</span>
                                    </div>
                                )}
                                {/* Fallback visible if error */}
                                <div className="hidden w-full h-full absolute inset-0 items-center justify-center text-gray-300 bg-gray-100">
                                     <span className="text-4xl">📚</span>
                                </div>
                                <div className="absolute top-2 right-2">
                                     <StatusBadge status={course.status} />
                                </div>
                            </div>
                            
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                     <h3 className="text-lg font-bold text-gray-800 line-clamp-1" title={course.title}>{course.title}</h3>
                                     <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded">{course.subjectCode}</span>
                                </div>
                                
                                <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1">{course.description}</p>
                                
                                <div className="grid grid-cols-2 gap-y-2 text-xs text-gray-500 mb-4 bg-gray-50 p-3 rounded-lg">
                                    <div>Module: <span className="font-semibold text-gray-700">{course.modules?.length || 0}</span></div>
                                    <div>Credits: <span className="font-semibold text-gray-700">{course.totalCredits || 0}</span></div>
                                    <div className="col-span-2">Schools: <span className="font-semibold text-gray-700">{course.eligibleSchools?.length || 0}</span></div>
                                </div>

                                <div className="flex gap-2 mt-auto">
                                    <button 
                                        onClick={() => navigate(`/admin/courses/edit/${course._id}`)}
                                        className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-100 transition text-center"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => setDeleteId(course._id)}
                                        className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 transition"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
             )}

             {/* Pagination */}
             {pagination && <Pagination currentPage={page} totalPages={pagination.pages} onPageChange={setPage} />}

             {/* Modals */}
             <CourseModal 
                 isOpen={isCourseModalOpen} 
                 onClose={() => setIsCourseModalOpen(false)}
                 onSave={handleCreateCourse}
                 isEditing={false}
             />

             <ConfirmDialog 
                 isOpen={!!deleteId}
                 title="Delete Course?"
                 message="Are you sure you want to delete this course? This action implies soft delete but will hide it from view."
                 onConfirm={handleDeleteCourse}
                 onCancel={() => setDeleteId(null)}
             />
        </div>
    );
};

export default CoursesDashboard;
