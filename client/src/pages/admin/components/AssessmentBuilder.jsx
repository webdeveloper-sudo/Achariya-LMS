import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { X, Save, Plus, Trash2, GripVertical, Copy, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { createAssessment, updateAssessment, getAssessmentById } from '../../../services/assessmentService';

const QUESTION_TYPES = [
    { value: 'multiple-choice', label: 'Multiple Choice' },
    { value: 'true-false', label: 'True / False' },
    { value: 'short-answer', label: 'Short Answer' },
    { value: 'essay', label: 'Essay' }
];

const AssessmentBuilder = ({ isOpen, onClose, moduleId, courseId, assessmentId }) => {
    // If assessmentId is provided, we are editing. If not, creating new for moduleId.
    const [isLoading, setIsLoading] = useState(false);
    
    // Schema-aligned defaults
    const { register, control, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm({
        defaultValues: {
            // assessmentId (auto)
            title: '',
            description: '',
            assessmentType: 'quiz', // quiz, assignment, exam, practice
            totalMarks: 0, // Should be calculated or manual? Schema says required. We can auto-calc.
            passingMarks: 0,
            duration: 30,
            attemptsAllowed: 0, // 0 = unlimited, Map to 'attempts' schema field
            showCorrectAnswers: true, 
            randomizeQuestions: false,
            isActive: true,
            questions: [] 
        }
    });

    const { fields, append, remove, move, update } = useFieldArray({
        control,
        name: "questions"
    });

    const questions = watch('questions');
    // Auto-calculate total marks from questions
    const calculatedTotalMarks = questions?.reduce((sum, q) => sum + (Number(q.marks) || 0), 0) || 0;

    // Effect to update totalMarks field when questions change
    useEffect(() => {
        setValue('totalMarks', calculatedTotalMarks);
    }, [calculatedTotalMarks, setValue]);

    useEffect(() => {
        if (isOpen && assessmentId) {
            loadAssessment();
        } else if (isOpen) {
            reset({
                title: '',
                description: '',
                assessmentType: 'quiz',
                totalMarks: 0,
                passingMarks: 0,
                duration: 30,
                attemptsAllowed: 0,
                showCorrectAnswers: true,
                randomizeQuestions: false,
                isActive: true,
                questions: [{ 
                    questionNumber: 1, 
                    questionText: '', 
                    questionType: 'multiple-choice', 
                    marks: 1, 
                    options: ['', ''], 
                    correctAnswer: '',
                    explanation: ''
                }]
            });
        }
    }, [isOpen, assessmentId]);

    const loadAssessment = async () => {
        setIsLoading(true);
        try {
            const res = await getAssessmentById(assessmentId);
            if (res.success) {
                // Map API data to Form data if needed
                const data = res.data;
                reset({
                    title: data.title || '',
                    description: data.description || '',
                    assessmentType: data.assessmentType || 'quiz',
                    totalMarks: data.totalMarks || 0,
                    passingMarks: data.passingMarks || 0,
                    duration: data.duration || 30,
                    attemptsAllowed: data.attempts || 0, // Schema: 'attempts', Form: 'attemptsAllowed'
                    showCorrectAnswers: data.showCorrectAnswers ?? true,
                    randomizeQuestions: data.randomizeQuestions ?? false,
                    isActive: data.isActive ?? true,
                    questions: data.questions || []
                });
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load assessment");
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = async (data) => {
        // Validate
        if (Number(data.passingMarks) > calculatedTotalMarks) {
            toast.error(`Passing marks (${data.passingMarks}) cannot be greater than total marks (${calculatedTotalMarks})`);
            return;
        }

        // Prepare info for API
        const payload = {
            ...data,
            moduleId,
            courseId,
            attempts: Number(data.attemptsAllowed), // Schema mapping
            questions: data.questions.map((q, idx) => ({
                ...q,
                questionNumber: idx + 1, // Ensure sequential
                marks: Number(q.marks)
            }))
        };
        
        try {
            if (assessmentId) {
                await updateAssessment(assessmentId, payload);
                toast.success("Assessment updated");
            } else {
                await createAssessment(moduleId, payload);
                toast.success("Assessment created");
            }
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Failed to save assessment");
        }
    };

    const onDragEnd = (result) => {
        if (!result.destination) return;
        move(result.source.index, result.destination.index);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] bg-gray-100 flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b flex justify-between items-center bg-white shadow-sm z-20">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            {assessmentId ? 'Edit Assessment' : 'Create Assessment'}
                        </h2>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>Total Marks: <span className="font-bold text-blue-600">{calculatedTotalMarks}</span></span>
                            <span>•</span>
                            <span>Questions: {fields.length}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition">
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit(onSubmit)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center shadow-lg active:scale-95 transition"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Save Assessment
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Settings Sidebar */}
                <div className="w-80 bg-white border-r overflow-y-auto hidden lg:block z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                    <div className="p-6">
                        <h3 className="font-bold text-gray-800 mb-6 text-lg border-b pb-2">Configuration</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
                                <input 
                                    {...register('title', { required: true })} 
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white" 
                                    placeholder="e.g. Final Quiz"
                                />
                                {errors.title && <span className="text-red-500 text-xs">Title is required</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Assessment Type</label>
                                <select {...register('assessmentType')} className="w-full px-3 py-2 border rounded-lg bg-gray-50 focus:bg-white cursor-pointer">
                                    <option value="quiz">Quiz</option>
                                    <option value="assignment">Assignment</option>
                                    <option value="exam">Exam</option>
                                    <option value="practice">Practice</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                                <textarea 
                                    {...register('description')} 
                                    rows={3}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white resize-none" 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Duration (min)</label>
                                    <input type="number" {...register('duration')} className="w-full px-3 py-2 border rounded-lg bg-gray-50 focus:bg-white" />
                                </div>
                                <div>
                                     <label className="block text-sm font-semibold text-gray-700 mb-1">Pass Marks</label>
                                     <input type="number" {...register('passingMarks')} className="w-full px-3 py-2 border rounded-lg bg-gray-50 focus:bg-white" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Attempts (0=Unlimited)</label>
                                <input type="number" {...register('attemptsAllowed')} className="w-full px-3 py-2 border rounded-lg bg-gray-50 focus:bg-white" />
                            </div>

                            <div className="space-y-3 pt-2 border-t">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input type="checkbox" {...register('showCorrectAnswers')} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                                    <span className="text-sm text-gray-700 select-none">Show answers after submit</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input type="checkbox" {...register('randomizeQuestions')} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                                    <span className="text-sm text-gray-700 select-none">Randomize questions</span>
                                </label>
                                 <label className="flex items-center space-x-2 cursor-pointer">
                                    <input type="checkbox" {...register('isActive')} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                                    <span className="text-sm text-gray-700 select-none">Assessment Active</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Questions Builder Area */}
                <div className="flex-1 bg-gray-100 p-8 overflow-y-auto">
                    <div className="max-w-4xl mx-auto space-y-6">
                        
                        <div className="flex justify-between items-end pb-2">
                             <h3 className="text-lg font-bold text-gray-800">Questions</h3>
                             <p className="text-sm text-gray-500 italic">Drag to reorder</p>
                        </div>
                       
                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="questions">
                                {(provided) => (
                                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-6">
                                        {fields.map((field, index) => (
                                            <Draggable key={field.id} draggableId={field.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        className={`bg-white rounded-xl shadow-sm border p-6 transition-shadow ${snapshot.isDragging ? 'shadow-xl ring-2 ring-blue-500/50' : ''}`}
                                                    >
                                                        <div className="flex items-start gap-4">
                                                            <div {...provided.dragHandleProps} className="mt-2 text-gray-300 cursor-copy hover:text-gray-600 transition p-1 hover:bg-gray-100 rounded">
                                                                <GripVertical className="w-5 h-5" />
                                                            </div>
                                                            <div className="mt-2 font-mono text-gray-400 font-bold w-6">#{index + 1}</div>
                                                            
                                                            <div className="flex-1 space-y-4">
                                                                {/* Question Header */}
                                                                <div className="flex gap-4">
                                                                    <div className="flex-1">
                                                                        <textarea
                                                                            {...register(`questions.${index}.questionText`, { required: true })}
                                                                            placeholder="Type your question here..."
                                                                            rows={2}
                                                                            className="w-full px-0 py-2 text-lg font-medium border-b border-gray-100 focus:border-blue-500 hover:border-gray-300 bg-transparent outline-none transition resize-none placeholder:text-gray-300"
                                                                        />
                                                                        {errors.questions?.[index]?.questionText && <span className="text-red-500 text-xs">Question text required</span>}
                                                                    </div>
                                                                    <div className="w-32">
                                                                        <select 
                                                                            {...register(`questions.${index}.questionType`)}
                                                                            className="block w-full py-2 pl-3 pr-8 text-sm font-semibold text-gray-700 bg-gray-50 border-transparent rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-100 cursor-pointer hover:bg-gray-100 transition"
                                                                        >
                                                                            {QUESTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                                                        </select>
                                                                    </div>
                                                                    <div className="w-20">
                                                                        <div className="relative">
                                                                            <input 
                                                                                type="number"
                                                                                {...register(`questions.${index}.marks`)}
                                                                                className="block w-full py-2 px-3 text-sm font-semibold text-right text-gray-700 bg-gray-50 border-transparent rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-100"
                                                                                placeholder="1"
                                                                            />
                                                                            <span className="absolute left-2 top-2 text-xs text-gray-400">Pts</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Answer Section */}
                                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                                    {watch(`questions.${index}.questionType`) === 'multiple-choice' && (
                                                                        <div className="space-y-3">
                                                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Options & Correct Answer</p>
                                                                            
                                                                            {/* Hardcoded 4 options for consistent layout as per typical quiz structure */}
                                                                            {[0, 1, 2, 3].map(optIdx => (
                                                                                <div key={optIdx} className="flex items-center gap-3">
                                                                                    <div className="relative flex items-center justify-center">
                                                                                         <input 
                                                                                            type="radio" 
                                                                                            value={watch(`questions.${index}.options.${optIdx}`)}
                                                                                            // Using a hidden output or controlled check logic
                                                                                            checked={watch(`questions.${index}.correctAnswer`) === watch(`questions.${index}.options.${optIdx}`) && watch(`questions.${index}.options.${optIdx}`) !== ''}
                                                                                            onChange={() => setValue(`questions.${index}.correctAnswer`, watch(`questions.${index}.options.${optIdx}`))}
                                                                                            className="peer w-5 h-5 text-blue-600 border-2 border-gray-300 focus:ring-blue-500 cursor-pointer"
                                                                                        />
                                                                                    </div>
                                                                                    
                                                                                    <input
                                                                                        {...register(`questions.${index}.options.${optIdx}`)}
                                                                                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                                                                                        placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                                                                                    />
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}

                                                                    {watch(`questions.${index}.questionType`) === 'true-false' && (
                                                                        <div className="flex gap-4">
                                                                            <label className={`flex-1 p-3 border rounded-lg cursor-pointer text-center transition ${watch(`questions.${index}.correctAnswer`) === 'True' ? 'bg-green-50 border-green-500 text-green-700 font-bold' : 'bg-white hover:bg-gray-50'}`}>
                                                                                <input 
                                                                                    type="radio" 
                                                                                    value="True"
                                                                                    {...register(`questions.${index}.correctAnswer`)}
                                                                                    className="hidden"
                                                                                />
                                                                                True
                                                                            </label>
                                                                            <label className={`flex-1 p-3 border rounded-lg cursor-pointer text-center transition ${watch(`questions.${index}.correctAnswer`) === 'False' ? 'bg-red-50 border-red-500 text-red-700 font-bold' : 'bg-white hover:bg-gray-50'}`}>
                                                                                <input 
                                                                                    type="radio" 
                                                                                    value="False"
                                                                                    {...register(`questions.${index}.correctAnswer`)}
                                                                                    className="hidden"
                                                                                />
                                                                                False
                                                                            </label>
                                                                        </div>
                                                                    )}

                                                                    {(watch(`questions.${index}.questionType`) === 'short-answer' || watch(`questions.${index}.questionType`) === 'essay') && (
                                                                        <div>
                                                                             <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Ideal Answer / Keywords</p>
                                                                             <textarea
                                                                                {...register(`questions.${index}.correctAnswer`)}
                                                                                rows={2}
                                                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                                                placeholder="Enter the correct answer or grading keywords..."
                                                                             />
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Explanation */}
                                                                <div>
                                                                     <input
                                                                        {...register(`questions.${index}.explanation`)}
                                                                        placeholder="Add an explanation for the correct answer (optional)"
                                                                        className="w-full px-4 py-2 text-sm bg-blue-50/50 border-none rounded-lg text-blue-800 placeholder:text-blue-300 focus:ring-1 focus:ring-blue-200 outline-none"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <button 
                                                                onClick={() => remove(index)}
                                                                className="text-gray-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition"
                                                                title="Delete Question"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
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

                        <button
                            onClick={() => append({ 
                                questionNumber: fields.length + 1, 
                                questionText: '', 
                                questionType: 'multiple-choice', 
                                marks: 1,
                                options: ['', '', '', ''],
                                correctAnswer: '',
                                explanation: ''
                            })}
                            className="w-full py-6 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition flex flex-col items-center justify-center gap-2 group cursor-pointer"
                        >
                            <div className="p-3 bg-gray-100 rounded-full group-hover:bg-blue-100 transition">
                                <Plus className="w-6 h-6" />
                            </div>
                            <span className="font-semibold text-lg">Add New Question</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssessmentBuilder;
