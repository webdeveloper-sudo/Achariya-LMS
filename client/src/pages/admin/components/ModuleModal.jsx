import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { X, Save, Upload, FileText, Video, Music, MonitorPlay, ListChecks, ArrowLeft, Loader2, CheckCircle, Lock } from 'lucide-react';
import FileUploadZone from './FileUploadZone';
import LoadingSpinner from './LoadingSpinner';
import { uploadModuleFile } from '../../../services/moduleService';
import { toast } from 'react-toastify';
import AssessmentBuilder from './AssessmentBuilder';

const ModuleModal = ({ isOpen, onClose, onSave, initialData, isEditing, courseId }) => {
    const [activeTab, setActiveTab] = useState('basic');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAssessmentBuilderOpen, setIsAssessmentBuilderOpen] = useState(false);
    const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);
    
    // Upload states
    const [uploadingNotes, setUploadingNotes] = useState(false);
    const [uploadingSlides, setUploadingSlides] = useState(false);
    const [uploadingAudio, setUploadingAudio] = useState(false);
    const [uploadingTranscript, setUploadingTranscript] = useState(false); // For audio transcript

    // Form setup
    const { register, handleSubmit, control, formState: { errors }, reset, setValue, watch, getValues } = useForm({
        defaultValues: {
            title: '',
            description: '',
            credits: 1,
            estimatedDuration: '',
            sequenceOrder: 1,
            status: 'draft',
            prerequisites: [],
            // Nested Objects
            videoTutorial: { url: '', title: '', duration: '', thumbnail: '' },
            moduleNotes: null, // { fileName, filePath, fileSize, uploadedOn }
            pptSlides: null, // { fileName, filePath, totalSlides, uploadedOn }
            audioContent: null // { url, title, duration, hasTranscript, transcriptPath }
        }
    });

    useEffect(() => {
        if (isOpen && initialData) {
            reset({
                ...initialData,
                videoTutorial: initialData.videoTutorial || { url: '', title: '', duration: '', thumbnail: '' },
                audioContent: initialData.audioContent || { url: '', title: '', duration: '', hasTranscript: false, transcriptPath: '' },
                moduleNotes: initialData.moduleNotes || null,
                pptSlides: initialData.pptSlides || null,
            });
             setActiveTab('basic');
        } else if (isOpen) {
            reset({
                title: '',
                description: '',
                credits: 1,
                estimatedDuration: '',
                sequenceOrder: 1,
                status: 'draft',
                prerequisites: [],
                videoTutorial: { url: '', title: '', duration: '', thumbnail: '' },
                moduleNotes: null,
                pptSlides: null,
                audioContent: null
            });
            setActiveTab('basic');
        }
    }, [isOpen, initialData, reset]);

    const handleFileUpload = async (file, type) => {
        if (!initialData?._id) {
            toast.warn("Please create the module first before uploading files.");
            return;
        }

        const setters = {
            'notes': setUploadingNotes,
            'slides': setUploadingSlides,
            'audio': setUploadingAudio,
            'transcript': setUploadingTranscript
        };
        const setter = setters[type];
        if(setter) setter(true);

        // Map UI type to Backend field logic if needed, or just pass generic 'type'
        // API likely expects: notes, slides, audio, transcript
        try {
            const res = await uploadModuleFile(initialData._id, type, file);
            if (res.success) {
                toast.success(`${type} uploaded successfully`);
                const fileData = res.data; // { fileName, filePath, fileSize, uploadedOn }

                if (type === 'notes') {
                    setValue('moduleNotes', fileData);
                } else if (type === 'slides') {
                    // Deprecated - ModuleModal might need updates to handle embed URL directly in form state instead of file upload
                    // Since Embed URL is a text field, it effectively doesn't use handleFileUpload, but purely state in the form
                    // We will handle this in UI rendering below
                    console.warn("Slides upload is deprecated");
                    // setValue('pptEmbedUrl', ...); // managed by input
                } else if (type === 'audio') {
                    // Start or update audioContent object
                    const currentAudio = getValues('audioContent') || {};
                    setValue('audioContent', {
                        ...currentAudio,
                        url: fileData.filePath, // Assuming audio upload returns path
                        title: fileData.fileName
                    });
                } else if (type === 'transcript') {
                    const currentAudio = getValues('audioContent') || {};
                    setValue('audioContent', {
                        ...currentAudio,
                        hasTranscript: true,
                        transcriptPath: fileData.filePath
                    });
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("Upload failed");
        } finally {
            if(setter) setter(false);
        }
    };

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            await onSave(data);
             // If creating (not editing), we might want to close OR switch to edit mode?
             // Usually close logic is handled by parent, but parent closes immediately.
             // If we want to allow uploads after create, we need to handle that flow.
             // For now, if creating, prompt user to re-open to add files or Auto-open?
             // The user request implies "Create form... with all fields".
             // If we can't upload without ID, we can't do it in one go unless the backend supports multipart create.
             // Assuming separate flow for simplicity: Create -> Then Edit for files.
            if (!isEditing) {
                // onClose(); 
                // Don't close, let parent handle data reload and perhaps re-inject initialData?
                // Parent currently closes modal on save.
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to save module");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const tabs = [
        { id: 'basic', label: 'Basic Info', icon: FileText },
        { id: 'notes', label: 'Notes (PDF)', icon: FileText },
        { id: 'video', label: 'Video Tutorial', icon: Video },
        { id: 'audio', label: 'Audio Content', icon: Music },
        { id: 'slides', label: 'PPT Slides', icon: MonitorPlay },
        { id: 'assessments', label: 'Assessments', icon: ListChecks, disabled: !isEditing },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b flex justify-between items-center bg-white">
                    <div>
                         <h2 className="text-xl font-bold text-gray-800">
                            {isEditing ? `Edit Module: ${initialData.title}` : 'Create New Module'}
                        </h2>
                        {!isEditing && <p className="text-sm text-gray-500">Step 1: Create module structure. Step 2: Add files.</p>}
                    </div>
                   
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Tabs & Content */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar Tabs */}
                    <div className="w-64 bg-gray-50 border-r overflow-y-auto">
                        <div className="p-2 space-y-1">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => !tab.disabled && setActiveTab(tab.id)}
                                    // Disable non-basic tabs if creating new module
                                    disabled={!isEditing && tab.id !== 'basic'} 
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition text-left
                                        ${activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-white hover:shadow-sm'}
                                        ${(!isEditing && tab.id !== 'basic') ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}
                                    `}
                                >
                                    <tab.icon className="w-5 h-5 flex-shrink-0" />
                                    <span>{tab.label}</span>
                                    {(!isEditing && tab.id !== 'basic') && <Lock className="w-3 h-3 ml-auto text-gray-400" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-sm border">
                            
                            {/* Basic Info Tab */}
                            {activeTab === 'basic' && (
                                <div className="space-y-6 animate-in fade-in duration-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Module Title *</label>
                                            <input
                                                {...register('title', { required: 'Title is required' })}
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                                placeholder="Enter module title"
                                            />
                                            {errors.title && <span className="text-red-500 text-xs">{errors.title.message}</span>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Estimated Duration</label>
                                            <input
                                                {...register('estimatedDuration')}
                                                placeholder="e.g. 2 hours"
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Sequence Order</label>
                                            <input
                                                type="number"
                                                {...register('sequenceOrder', { valueAsNumber: true })}
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder="e.g. 1"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Credits *</label>
                                            <input
                                                type="number"
                                                {...register('credits', { required: true, min: 1 })}
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                         <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                                            <select {...register('status')} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                                                <option value="draft">Draft</option>
                                                <option value="published">Published</option>
                                                <option value="archived">Archived</option>
                                            </select>
                                        </div>

                                        <div className="col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
                                            <textarea
                                                {...register('description', { required: 'Description is required', maxLength: 2000 })}
                                                rows={5}
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                                placeholder="Detailed description of the module content..."
                                            />
                                            {errors.description && <span className="text-red-500 text-xs">{errors.description.message}</span>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Notes Tab */}
                            {activeTab === 'notes' && (
                                <div className="space-y-6 animate-in fade-in duration-200">
                                    <div className="flex items-center justify-between border-b pb-4">
                                         <h3 className="text-lg font-bold text-gray-800">Module Notes</h3>
                                         {watch('moduleNotes') && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> Uploaded</span>}
                                    </div>
                                    
                                    <FileUploadZone
                                        acceptedFileTypes={{'application/pdf': ['.pdf']}}
                                        maxSize={50 * 1024 * 1024}
                                        onUpload={(f) => handleFileUpload(f, 'notes')}
                                        onRemove={() => setValue('moduleNotes', null)}
                                        currentFile={watch('moduleNotes')}
                                        label="Upload PDF Notes File"
                                    />
                                    {uploadingNotes && <LoadingSpinner message="Uploading notes..." />}
                                    
                                    {watch('moduleNotes') && (
                                        <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">File Name:</span>
                                                <span className="font-medium text-gray-800">{watch('moduleNotes').fileName}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">File Path:</span>
                                                <span className="font-medium text-gray-800 break-all">{watch('moduleNotes').filePath}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                             {/* Slides Tab */}
                             {activeTab === 'slides' && (
                                <div className="space-y-6 animate-in fade-in duration-200">
                                    <div className="flex items-center justify-between border-b pb-4">
                                         <h3 className="text-lg font-bold text-gray-800">Presentation Slides</h3>
                                    </div>
                                    
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
                                        <label className="block text-sm font-semibold text-blue-900 mb-1">
                                            Google Slides Embed URL
                                        </label>
                                        <textarea
                                            value={watch('pptEmbedUrl') || ''}
                                            onChange={(e) => setValue('pptEmbedUrl', e.target.value)}
                                            placeholder='<iframe src="https://docs.google.com/presentation/..." ...></iframe>'
                                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
                                            rows={4}
                                        />
                                        <p className="text-xs text-blue-700 mt-2">
                                            Paste the full iframe code from Google Slides (File &gt; Share &gt; Publish to web &gt; Embed).
                                        </p>
                                    </div>

                                    {/* Embed Preview */}
                                    {(() => {
                                        const embedCode = watch("pptEmbedUrl");
                                        if (embedCode) {
                                            return (
                                                <div className="mt-4 border rounded-xl overflow-hidden shadow-sm bg-gray-100">
                                                    <div className="p-3 bg-gray-200 border-b flex items-center justify-between">
                                                        <span className="text-xs font-bold text-gray-500 uppercase">
                                                            Slide Preview
                                                        </span>
                                                    </div>
                                                    <div 
                                                        className="w-full h-[300px] flex justify-center bg-black"
                                                        dangerouslySetInnerHTML={{ __html: embedCode }}
                                                    />
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}
                                </div>
                            )}

                             {/* Video Tab */}
                             {activeTab === 'video' && (
                                <div className="space-y-6 animate-in fade-in duration-200">
                                    <div className="flex items-center justify-between border-b pb-4">
                                         <h3 className="text-lg font-bold text-gray-800">Video Tutorial</h3>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Video URL (YouTube/Vimeo) *</label>
                                            <input
                                                {...register('videoTutorial.url')}
                                                placeholder="https://youtube.com/watch?v=..."
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Video Title</label>
                                            <input
                                                {...register('videoTutorial.title')}
                                                placeholder="Title for the video"
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                             <label className="block text-sm font-semibold text-gray-700 mb-1">Duration</label>
                                             <input
                                                {...register('videoTutorial.duration')}
                                                placeholder="e.g. 10:30"
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                             {/* Audio Tab */}
                             {activeTab === 'audio' && (
                                <div className="space-y-6 animate-in fade-in duration-200">
                                    <div className="flex items-center justify-between border-b pb-4">
                                         <h3 className="text-lg font-bold text-gray-800">Audio Content</h3>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="col-span-2 bg-blue-50 p-4 rounded-xl border border-blue-100 mb-2">
                                            <label className="block text-sm font-bold text-blue-800 mb-2">Upload Audio File</label>
                                            <FileUploadZone
                                                acceptedFileTypes={{
                                                    'audio/*': ['.mp3', '.wav', '.m4a']
                                                }}
                                                maxSize={100 * 1024 * 1024}
                                                onUpload={(f) => handleFileUpload(f, 'audio')}
                                                onRemove={() => setValue('audioContent.url', '')} // Needs nuanced handling if generic uploader
                                                currentFile={watch('audioContent.url') ? { name: watch('audioContent.title') || 'Audio File' } : null}
                                                label="Upload Audio File (MP3/WAV)"
                                            />
                                            {uploadingAudio && <LoadingSpinner message="Uploading audio..." />}
                                        </div>

                                        <div className="col-span-2">
                                             <label className="block text-sm font-semibold text-gray-700 mb-1">Or Enter Audio URL</label>
                                             <input
                                                {...register('audioContent.url')}
                                                placeholder="https://..."
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Audio Title</label>
                                            <input
                                                {...register('audioContent.title')}
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                             <label className="block text-sm font-semibold text-gray-700 mb-1">Duration</label>
                                             <input
                                                {...register('audioContent.duration')}
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                        
                                        <div className="col-span-2 pt-4 border-t">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Transcript</label>
                                             <FileUploadZone
                                                acceptedFileTypes={{'application/pdf': ['.pdf'], 'text/plain': ['.txt']}}
                                                maxSize={10 * 1024 * 1024}
                                                onUpload={(f) => handleFileUpload(f, 'transcript')}
                                                onRemove={() => { setValue('audioContent.hasTranscript', false); setValue('audioContent.transcriptPath', ''); }}
                                                currentFile={watch('audioContent.hasTranscript') ? { name: 'Transcript File' } : null}
                                                label="Upload Transcript (PDF/TXT)"
                                            />
                                             {uploadingTranscript && <LoadingSpinner message="Uploading transcript..." />}
                                        </div>
                                    </div>
                                </div>
                            )}

                             {/* Assessments Tab */}
                             {activeTab === 'assessments' && (
                                <div className="space-y-6 animate-in fade-in duration-200">
                                    <div className="flex items-center justify-between border-b pb-4">
                                         <h3 className="text-lg font-bold text-gray-800">Module Assessments</h3>
                                         <button 
                                            type="button" 
                                            onClick={() => { setSelectedAssessmentId(null); setIsAssessmentBuilderOpen(true); }}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm flex items-center"
                                        >
                                            <ListChecks className="w-4 h-4 mr-2" />
                                            Create New Assessment
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {initialData?.assessments?.length > 0 ? (
                                            initialData.assessments.map((ass, index) => (
                                                <div key={ass._id || index} className="p-4 border rounded-xl bg-white flex justify-between items-center hover:shadow-sm transition">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-gray-800">{ass.title}</span>
                                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ass.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                                {ass.isActive ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            {ass.assessmentType.toUpperCase()} • {ass.questions?.length || 0} Questions • {ass.totalMarks} Marks
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                         <button 
                                                            type="button"
                                                            onClick={() => { setSelectedAssessmentId(ass._id); setIsAssessmentBuilderOpen(true); }}
                                                            className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition"
                                                        >
                                                            Edit
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                                <ListChecks className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                                <p className="text-gray-500 font-medium">No assessments added yet</p>
                                                <p className="text-gray-400 text-sm mt-1">Create a quiz or exam for this module</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-white flex justify-end gap-3 z-10">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
                    >
                        Close
                    </button>
                    <button
                        onClick={handleSubmit(onSubmit)}
                        className="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center shadow-lg active:scale-95 transition font-medium"
                        disabled={isSubmitting}
                    >
                         {isSubmitting ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                         {isEditing ? 'Save Changes' : 'Create Module'}
                    </button>
                </div>
            </div>

            {/* Nested Assessment Builder Modal */}
            <AssessmentBuilder
                isOpen={isAssessmentBuilderOpen}
                onClose={() => { setIsAssessmentBuilderOpen(false); if(onSave) onSave(getValues()); /* Optimistic refresh? Or wait for parent refresh */ }} 
                moduleId={initialData?._id}
                courseId={courseId}
                assessmentId={selectedAssessmentId}
            />
        </div>
    );
};

export default ModuleModal;
