import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, Plus, Edit, Trash2, GripVertical, 
    FileText, Video, Music, MonitorPlay, ListChecks 
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { getCourses, createCourse, deleteCourse, updateCourseStatus, updateCourse, getCourseById } from "@/services/courseService.js";
import { getModulesByCourse, createModule, updateModule, deleteModule, reorderModules } from "@/services/moduleService.js";
import ModuleModal from './components/ModuleModal';
import CourseModal from './components/CourseModal';
import ConfirmDialog from './components/ConfirmDialog';
import StatusBadge from './components/StatusBadge';
import LoadingSpinner from './components/LoadingSpinner';
import { toast } from 'react-toastify';

const CoursePage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Modals
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
    const [selectedModule, setSelectedModule] = useState(null);
    
    // Delete states
    const [deleteCourseOpen, setDeleteCourseOpen] = useState(false);
    const [deleteModuleId, setDeleteModuleId] = useState(null);

    // Reorder state
    const [isReordering, setIsReordering] = useState(false);

    useEffect(() => {
        fetchCourseData();
    }, [courseId]);

    const fetchCourseData = async () => {
        setLoading(true);
        try {
            const res = await getCourseById(courseId);
            if (res.success) {
                setCourse(res.data);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load course details");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateCourse = async (data) => {
        try {
            const res = await updateCourse(courseId, data);
            if (res.success) {
                toast.success("Course updated");
                setCourse(res.data); // Update local state
                fetchCourseData(); // Refresh to ensure sync
            }
        } catch (error) {
            toast.error("Failed to update course");
        }
    };

    const handleDeleteCourse = async () => {
        try {
            await deleteCourse(courseId);
            toast.success("Course deleted");
            navigate('/admin/courses');
        } catch (error) {
            toast.error("Failed to delete course");
        }
    };

    const handleSaveModule = async (moduleData) => {
        try {
            if (selectedModule) {
                await updateModule(selectedModule._id, moduleData);
                toast.success("Module updated");
            } else {
                await createModule(courseId, moduleData);
                toast.success("Module created");
            }
            fetchCourseData(); // Refresh modules list
            setIsModuleModalOpen(false);
        } catch (error) {
            console.error(error);
            // toast handled in modal or here
        }
    };

    const handleDeleteModule = async () => {
        if(!deleteModuleId) return;
        try {
            await deleteModule(deleteModuleId);
            toast.success("Module deleted");
            fetchCourseData();
        } catch (error) {
            toast.error("Failed to delete module");
        } finally {
            setDeleteModuleId(null);
        }
    };

    const onDragEnd = async (result) => {
        if (!result.destination) return;
        if (!isReordering) return;

        const items = Array.from(course.modules);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Optimistic update
        setCourse(prev => ({ ...prev, modules: items }));

        // API call
        try {
            const moduleIds = items.map(m => m._id);
            await reorderModules(moduleIds);
            toast.success("Order updated");
        } catch (error) {
            toast.error("Failed to update order");
            fetchCourseData(); // Revert on error
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><LoadingSpinner size="large" /></div>;
    if (!course) return <div className="p-8 text-center">Course not found</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/admin/courses')} className="p-2 hover:bg-gray-200 rounded-full transition">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                             <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
                             <StatusBadge status={course.status} />
                        </div>
                        <p className="text-sm text-gray-500">{course.subjectCode} • {course.totalCredits} Credits</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setIsCourseModalOpen(true)}
                        className="px-4 py-2 bg-white border text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                    >
                        Edit Details
                    </button>
                    <button 
                        onClick={() => setDeleteCourseOpen(true)}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium"
                    >
                        Delete Course
                    </button>
                </div>
            </div>

            {/* Course Details Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">About Course</h2>
                <p className="text-gray-600 mb-4">{course.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <span className="text-gray-500 block">Assigned Teachers</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {course.assignedTeachers?.length > 0 ? course.assignedTeachers.map(t => (
                                <span key={t._id} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">{t.userName || t.name}</span>
                            )) : <span className="text-gray-400">None</span>}
                        </div>
                    </div>
                    <div>
                        <span className="text-gray-500 block">Eligible Grades</span>
                        <span className="text-gray-900">{course.gradesEligible?.join(', ') || 'All'}</span>
                    </div>
                     <div>
                        <span className="text-gray-500 block">Schools</span>
                        <span className="text-gray-900">{course.eligibleSchools?.length || 0} Schools Assigned</span>
                    </div>
                </div>
            </div>

            {/* Modules Section */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Modules ({course.modules?.length || 0})</h2>
                    <div className="flex gap-2">
                         <button 
                            onClick={() => setIsReordering(!isReordering)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${isReordering ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-200'}`}
                        >
                            {isReordering ? 'Done Reordering' : 'Reorder'}
                        </button>
                        <button 
                            onClick={() => { setSelectedModule(null); setIsModuleModalOpen(true); }}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Module
                        </button>
                    </div>
                </div>

                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="modules">
                        {(provided) => (
                            <div 
                                {...provided.droppableProps} 
                                ref={provided.innerRef}
                                className="space-y-4"
                            >
                                {course.modules?.map((module, index) => (
                                    <Draggable 
                                        key={module._id} 
                                        draggableId={module._id} 
                                        index={index}
                                        isDragDisabled={!isReordering}
                                    >
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className={`bg-white rounded-xl border shadow-sm p-4 hover:shadow-md transition ${snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500' : ''}`}
                                            >
                                                <div className="flex items-start gap-4">
                                                    {isReordering && (
                                                        <div {...provided.dragHandleProps} className="mt-1 cursor-grab text-gray-400 hover:text-gray-600">
                                                            <GripVertical className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                    
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h3 className="font-bold text-gray-800 text-lg">{module.title}</h3>
                                                                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                                                    <span>{module.credits || 0} Credits</span>
                                                                    <span>•</span>
                                                                    <span>{module.estimatedDuration}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <button 
                                                                    onClick={() => { setSelectedModule(module); setIsModuleModalOpen(true); }}
                                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                </button>
                                                                <button 
                                                                     onClick={() => setDeleteModuleId(module._id)}
                                                                     className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Content Indicators */}
                                                        <div className="flex gap-4 mt-4 text-sm text-gray-500 border-t pt-3">
                                                            <div className={`flex items-center gap-1 ${module.moduleNotes ? 'text-green-600' : 'text-gray-300'}`}>
                                                                <FileText className="w-4 h-4" />
                                                                <span>Notes</span>
                                                            </div>
                                                            <div className={`flex items-center gap-1 ${module.videoTutorial?.url ? 'text-green-600' : 'text-gray-300'}`}>
                                                                <Video className="w-4 h-4" />
                                                                <span>Video</span>
                                                            </div>
                                                            <div className={`flex items-center gap-1 ${module.audioContent ? 'text-green-600' : 'text-gray-300'}`}>
                                                                <Music className="w-4 h-4" />
                                                                <span>Audio</span>
                                                            </div>
                                                            <div className={`flex items-center gap-1 ${module.pptSlides ? 'text-green-600' : 'text-gray-300'}`}>
                                                                <MonitorPlay className="w-4 h-4" />
                                                                <span>Slides</span>
                                                            </div>
                                                            <div className={`flex items-center gap-1 ${module.assessments?.length > 0 ? 'text-blue-600' : 'text-gray-300'}`}>
                                                                <ListChecks className="w-4 h-4" />
                                                                <span>{module.assessments?.length || 0} Assessments</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>

                {(!course.modules || course.modules.length === 0) && (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed">
                        <p className="text-gray-500">No modules yet.</p>
                        <button onClick={() => { setSelectedModule(null); setIsModuleModalOpen(true); }} className="text-blue-600 font-medium mt-2">Add your first module</button>
                    </div>
                )}
            </div>

            {/* Modals */}
             <CourseModal 
                 isOpen={isCourseModalOpen} 
                 onClose={() => setIsCourseModalOpen(false)}
                 onSave={handleUpdateCourse}
                 initialData={course}
                 isEditing={true}
             />

             <ModuleModal
                isOpen={isModuleModalOpen}
                onClose={() => setIsModuleModalOpen(false)}
                onSave={handleSaveModule}
                initialData={selectedModule}
                isEditing={!!selectedModule}
                courseId={courseId}
             />

             <ConfirmDialog 
                 isOpen={deleteCourseOpen}
                 title="Delete Course"
                 message="Are you sure? This cannot be undone."
                 onConfirm={handleDeleteCourse}
                 onCancel={() => setDeleteCourseOpen(false)}
             />

             <ConfirmDialog 
                 isOpen={!!deleteModuleId}
                 title="Delete Module"
                 message="Are you sure? All associated files will be removed."
                 onConfirm={handleDeleteModule}
                 onCancel={() => setDeleteModuleId(null)}
             />
        </div>
    );
};

export default CoursePage;
