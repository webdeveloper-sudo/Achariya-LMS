    import React, { useEffect, useState, useRef } from 'react';
    import { useForm, Controller } from 'react-hook-form';
    import { X, Save, Upload, Loader2, AlertCircle, Search, Plus, Filter } from 'lucide-react';
    import FileUploadZone from './FileUploadZone';
    import LoadingSpinner from './LoadingSpinner';
    import { uploadCourseThumbnail } from '../../../services/courseService';
    // Import services differently if needed based on previous context, but keeping consistent
    import adminApi from '../../../services/adminApi'; 
    import axiosInstance from '../../../api/axiosInstance';
    import { toast } from 'react-toastify';
    import ModuleModal from './ModuleModal'; 
import { allschoolsdata, allsubjects, ALL_CLASSES} from "@/data/global/global";

    // Static Data as requested
    const ACHARIYA_SCHOOLS = 
    // MultiSelect Component (Reused/Refined)
    const MultiSelect = ({ label, options, value = [], onChange, placeholder, isLoading }) => {
        const [query, setQuery] = useState('');
        const [isOpen, setIsOpen] = useState(false);
        const containerRef = useRef(null);

        useEffect(() => {
            const handleClickOutside = (event) => {
                if (containerRef.current && !containerRef.current.contains(event.target)) {
                    setIsOpen(false);
                }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, []);

        const filteredOptions = options.filter(opt =>
            opt.label.toLowerCase().includes(query.toLowerCase()) &&
            !value.includes(opt.value)
        );

        const handleSelect = (optionValue) => {
            onChange([...value, optionValue]);
            setQuery('');
        };

        const handleRemove = (optionValue) => {
            onChange(value.filter(v => v !== optionValue));
        };

        const getLabel = (val) => options.find(o => o.value === val)?.label || val;

        return (
            <div className="relative" ref={containerRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <div
                    className="min-h-[42px] p-2 border rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition flex flex-wrap gap-2 cursor-text"
                    onClick={() => setIsOpen(true)}
                >
                    {value.map(val => (
                        <span key={val} className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-700 text-sm border border-blue-100">
                            {getLabel(val)}
                            <button type="button" onClick={(e) => { e.stopPropagation(); handleRemove(val); }} className="ml-1 hover:text-blue-900 rounded-full hover:bg-blue-200 p-0.5">
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                    <input
                        type="text"
                        value={query}
                        onChange={e => { setQuery(e.target.value); setIsOpen(true); }}
                        onFocus={() => setIsOpen(true)}
                        className="flex-1 outline-none min-w-[120px] bg-transparent text-sm py-1"
                        placeholder={value.length === 0 ? placeholder : ""}
                    />
                </div>

                {isOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                        {isLoading ? (
                            <div className="p-4 text-center text-gray-500"><LoadingSpinner size="small" /></div>
                        ) : filteredOptions.length > 0 ? (
                            filteredOptions.map(opt => (
                                <button
                                    type="button"
                                    key={opt.value}
                                    onClick={() => handleSelect(opt.value)}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 flex justify-between items-center transition"
                                >
                                    <span>{opt.label}</span>
                                    <Plus className="w-4 h-4 text-gray-400" />
                                </button>
                            ))
                        ) : (
                            <div className="p-4 text-center text-gray-500 text-sm">No options found</div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const CourseModal = ({ isOpen, onClose, onSave, initialData, isEditing }) => {
        const [allTeachers, setAllTeachers] = useState([]);
        const [filteredTeachers, setFilteredTeachers] = useState([]);
        const [isLoadingOptions, setIsLoadingOptions] = useState(false);
        const [isSubmitting, setIsSubmitting] = useState(false);
        const [thumbnailPreview, setThumbnailPreview] = useState(initialData?.thumbnail || null);
        
        // For module embedding
        // We can't easily nest the FULL ModuleModal state because ModuleModal handles its own state heavily.
        // However, the prompt says "just directly import the ui of the modulemodal component". 
        // If I render ModuleModal, it's a modal (fixed inset-0).
        // I should probably render it conditionally or strip its modal wrapper?
        // Actually, creating a course usually requires basic info first.
        // "Add a section for atleast adding one module is mandatory (in new course)"
        // I will use a simplified embedded version or just trigger the modal logic?
        // "import the UI" -> I'll stick to opening it or embedding it. 
        // Given the complexity of ModuleModal (Tabs, Uploads), strictly embedding it in a scrollable CourseModal might be UX heavy.
        // BUT the user asked to "import the ui". 
        // I will add a button to "Configure Initial Module" which opens the ModuleModal (but effectively part of this flow).
        // AND I need to capture that module data.
        // Problem: ModuleModal saves to Backend usually. 
        // If Creating Course: Module cannot be saved to backend without course ID.
        // Prompt earlier: "Course Schema... totalCredits calculated from sum of all module credits... modules: Array of ObjectIds"
        // So Course needs to exist or be created transactionally.
        // Implementation:
        // 1. Fill Course Info.
        // 2. Click "Add Module".
        // 3. This opens ModuleModal UI (visually embedded or on top).
        // 4. Since Course ID doesn't exist, ModuleModal might need to return DATA instead of saving?
        //    The ModuleModal I wrote takes `onSave`.
        //    If !isEditing (Course), I can pass an `onSave` to ModuleModal that just sets state in CourseModal.
        //    BUT ModuleModal does uploads which require ID.
        //    So we have a catch-22 unless we create the Course first as Draft.
        //    I will implement: User fills Course -> Click Create -> 
        //    Actually, "section for adding one module is mandatory".
        //    I will store the initial module data in state.
        //    For uploads in that initial module? The user "need fields" list for module included files.
        //    We can't upload files without ID usually.
        //    I will handle this by creating the course + module structure FIRST on Save, then optionally letting them upload files?
        //    OR I will use the `ModuleModal` to edit the "Initial Module" data in memory.
        
        const [initialModuleData, setInitialModuleData] = useState(null);
        const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);

        const { register, handleSubmit, control, formState: { errors }, reset, setValue, watch } = useForm({
            defaultValues: {
                title: '',
                description: '',
                subjectCode: '',
                status: 'draft',
                eligibleSchools: [],
                assignedTeachers: [], // Array of IDs
                thumbnail: ''
            }
        });

        const watchEligibleSchools = watch('eligibleSchools');
        // const watchTitle = watch('title'); // Removed title filtering as per thought process, focusing on school filtering

        useEffect(() => {
            if (isOpen) {
                fetchTeachers();
                if (initialData) {
                    reset({
                        title: initialData.title || '',
                        description: initialData.description || '',
                        subjectCode: initialData.subjectCode || '',
                        status: initialData.status || 'draft',
                        eligibleSchools: initialData.eligibleSchools?.map(s => typeof s === 'string' ? s : s.name) || [],
                        assignedTeachers: initialData.assignedTeachers?.map(t => t._id) || [],
                        thumbnail: initialData.thumbnail || ''
                    });
                    setThumbnailPreview(initialData.thumbnail);
                    setInitialModuleData(null); 
                } else {
                    reset({
                        status: 'draft',
                        eligibleSchools: [],
                        assignedTeachers: []
                    });
                    setThumbnailPreview(null);
                    setInitialModuleData(null);
                }
            }
        }, [isOpen, initialData, reset]);

        const fetchTeachers = async () => {
            setIsLoadingOptions(true);
            try {
                const res = await axiosInstance.get("/admin/teachers");
                // Assuming res.data.data is the array or res.data is the array
                // The service previously used `response.data`.
                // Let's assume standard response structure.
                const teachers = res.data.data || res.data || [];
                
                // Map to options
                const formatted = teachers.map(t => ({
                    label: `${t.userName} (${t.branch || 'No Branch'})`,
                    value: t._id,
                    branch: t.branch, // for filtering
                    subjects: t.subjects // for potential subject filtering
                }));
                setAllTeachers(formatted);
                setFilteredTeachers(formatted);
            } catch (error) {
                console.error("Failed to fetch teachers", error);
                toast.error("Failed to load teachers");
            } finally {
                setIsLoadingOptions(false);
            }
        };

        // Filter logic
        useEffect(() => {
            if (allTeachers.length > 0) {
                // "Filter teachers from all eligible schools only"
                // If eligibleSchools is empty, maybe show all (or none? Prompt implies dependency).
                // Let's show all if empty, or filter if populated.
                
                if (watchEligibleSchools && watchEligibleSchools.length > 0) {
                    const filtered = allTeachers.filter(t => 
                        // Check if teacher's branch matches one of the selected schools
                        // t.branch is the School Name
                        watchEligibleSchools.includes(t.branch)
                    );
                    setFilteredTeachers(filtered);
                } else {
                    setFilteredTeachers(allTeachers);
                }
            }
        }, [watchEligibleSchools, allTeachers]);

        const handleThumbnailUpload = async (file) => {
            try {
                const response = await uploadCourseThumbnail(file);
                if (response.success) {
                    setValue('thumbnail', response.data.url || response.data);
                    setThumbnailPreview(URL.createObjectURL(file)); 
                }
            } catch (error) {
                console.error(error);
                toast.error("Thumbnail upload failed");
            }
        };

        const handleModuleSave = (moduleData) => {
            // This is called when the embedded ModuleModal saves
            setInitialModuleData(moduleData);
            setIsModuleModalOpen(false);
            toast.success("Module details staged for creation");
        };

        const onSubmit = async (data) => {
            setIsSubmitting(true);
            try {
                // Validation for mandatory module
                if (!isEditing && !initialModuleData) {
                    toast.error("Please add the mandatory first module.");
                    setIsSubmitting(false);
                    return;
                }

                const payload = {
                    ...data,
                    initialModule: initialModuleData // Pass this to parent handler
                };

                await onSave(payload);
                onClose();
            } catch (error) {
                console.error(error);
                toast.error("Failed to save course");
            } finally {
                setIsSubmitting(false);
            }
        };

        if (!isOpen) return null;

        // School Options
        const schoolOptions = ACHARIYA_SCHOOLS.map(s => ({
            label: `${s.name} - ${s.location}`,
            value: s.name
        }));

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
                    {/* Header */}
                    <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">
                                {isEditing ? 'Edit Course' : 'Create New Course'}
                            </h2>
                            {initialData?.courseId && <p className="text-sm text-gray-500 font-mono">{initialData.courseId}</p>}
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
                            <X className="w-6 h-6 text-gray-500" />
                        </button>
                    </div>

                    {/* Body */}
                    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8 flex-1">
                        
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Course Title *</label>
                                <input
                                    {...register('title', { required: 'Title is required' })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    placeholder="e.g. Advanced Physics"
                                />
                                {errors.title && <span className="text-red-500 text-xs">{errors.title.message}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Code *</label>
                                <input
                                    {...register('subjectCode', { required: 'Subject Code is required' })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition uppercase"
                                    placeholder="e.g. PHY-101"
                                />
                                {errors.subjectCode && <span className="text-red-500 text-xs">{errors.subjectCode.message}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Course ID</label>
                                <input
                                    value={initialData?.courseId || 'Auto-generated'}
                                    disabled
                                    className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-500"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                                <textarea
                                    {...register('description', { required: 'Description is required' })}
                                    rows={4}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    placeholder="Course description..."
                                />
                                {errors.description && <span className="text-red-500 text-xs">{errors.description.message}</span>}
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail</label>
                                <div className="flex items-start gap-4">
                                    {thumbnailPreview && (
                                        <img src={thumbnailPreview} alt="Preview" className="w-32 h-20 object-cover rounded-lg border" />
                                    )}
                                    <div className="flex-1">
                                        <FileUploadZone
                                            acceptedFileTypes={{'image/*': ['.png', '.jpg', '.jpeg']}}
                                            maxSize={5 * 1024 * 1024}
                                            onUpload={handleThumbnailUpload}
                                            onRemove={() => { setValue('thumbnail', ''); setThumbnailPreview(null); }}
                                            currentFile={thumbnailPreview ? { name: 'Current Image' } : null}
                                            label="Upload Thumbnail"
                                        />
                                        <input type="hidden" {...register('thumbnail')} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Schools & Teachers - MultiSelects */}
                        <div className="space-y-6 pt-6 border-t">
                            <h3 className="text-lg font-semibold text-gray-700">Assignments</h3>
                            
                            <div>
                                <Controller
                                    name="eligibleSchools"
                                    control={control}
                                    render={({ field }) => (
                                        <MultiSelect
                                            label="Eligible Schools"
                                            options={schoolOptions}
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="Select schools..."
                                        />
                                    )}
                                />
                            </div>

                            <div>
                                <Controller
                                    name="assignedTeachers"
                                    control={control}
                                    render={({ field }) => (
                                        <MultiSelect
                                            label="Assigned Teachers"
                                            options={filteredTeachers} // Filtered based on selected schools
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder={watchEligibleSchools.length === 0 ? "Select schools first to see teachers..." : "Select teachers..."}
                                            isLoading={isLoadingOptions}
                                        />
                                    )}
                                />
                                {watchEligibleSchools.length > 0 && <p className="text-xs text-gray-500 mt-1">Showing teachers from selected schools only.</p>}
                            </div>
                        </div>

                        {/* Mandatory Module Section (New Course Only) */}
                        {!isEditing && (
                            <div className="space-y-4 pt-6 border-t">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-gray-700">Initial Module (Mandatory)</h3>
                                    <button
                                        type="button"
                                        onClick={() => setIsModuleModalOpen(true)}
                                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition flex items-center"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        {initialModuleData ? 'Edit Module Details' : 'Add Module Details'}
                                    </button>
                                </div>
                                
                                {initialModuleData ? (
                                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <h4 className="font-bold text-green-800">{initialModuleData.title}</h4>
                                        <p className="text-sm text-green-700 line-clamp-1">{initialModuleData.description}</p>
                                        <div className="flex gap-4 mt-2 text-xs text-green-600">
                                            <span>Credits: {initialModuleData.credits}</span>
                                            <span>Duration: {initialModuleData.estimatedDuration}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        Please add module details to proceed.
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Status */}
                        <div className="pt-6 border-t">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <div className="flex gap-4">
                                {['draft', 'published', 'archived'].map(status => (
                                    <label key={status} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            value={status}
                                            {...register('status')}
                                            className="text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="capitalize text-sm font-medium text-gray-700">{status}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex justify-end gap-3 pt-6 border-t bg-white sticky bottom-0">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition font-medium"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition font-medium flex items-center shadow-md active:bg-blue-800"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5 mr-2" />
                                        {isEditing ? 'Update Course' : 'Create Course'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Embedded Module Modal */}
                <ModuleModal
                    isOpen={isModuleModalOpen}
                    onClose={() => setIsModuleModalOpen(false)}
                    onSave={handleModuleSave} // Local staging
                    initialData={initialModuleData}
                    isEditing={false} // Treat as new/staging
                    courseId={null} // No course ID yet
                />
            </div>
        );
    };

    export default CourseModal;
