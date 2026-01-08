import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { X, Save, Plus, Trash2, GripVertical, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { createAssessment, updateAssessment, getAssessmentById } from '../../../services/assessmentService';

const QUESTION_TYPES = [
    { value: 'multiple-choice', label: 'Multiple Choice' },
    { value: 'true-false', label: 'True / False' },
    { value: 'fill-ups', label: 'Fill in the Blanks' },
    { value: 'short-answer', label: 'Short Answer' },
    { value: 'essay', label: 'Essay' }
];

const AssessmentBuilder = ({ isOpen, onClose, moduleId, courseId, assessmentId, isEmbedded = false }) => {
    const [isLoading, setIsLoading] = useState(false);
    
    const { register, control, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm({
        defaultValues: {
            title: '',
            description: '',
            assessmentType: 'quiz',
            totalMarks: 0,
            passingMarks: 0, // Using this as Credits logic placeholder if needed, or separate field
            duration: 30,
            durationUnit: 'min', // New UI state
            attemptsAllowed: 3, 
            credits: 5, // New field requested
            showCorrectAnswers: true, 
            randomizeQuestions: false,
            isActive: true,
            questions: [] 
        }
    });

    const { fields, append, remove, move } = useFieldArray({
        control,
        name: "questions"
    });

    const questions = watch('questions');
    const calculatedTotalMarks = questions?.reduce((sum, q) => sum + (Number(q.marks) || 0), 0) || 0;

    useEffect(() => {
        setValue('totalMarks', calculatedTotalMarks);
    }, [calculatedTotalMarks, setValue]);

    useEffect(() => {
        if ((isOpen || isEmbedded) && assessmentId) {
            loadAssessment();
        } else if (isOpen || isEmbedded) {
            reset({
                title: '',
                description: '',
                assessmentType: 'quiz',
                totalMarks: 0,
                passingMarks: 0,
                duration: 30,
                durationUnit: 'min',
                attemptsAllowed: 3,
                credits: 5,
                showCorrectAnswers: true,
                randomizeQuestions: false,
                isActive: true,
                questions: [{ 
                    questionNumber: 1, 
                    questionText: '', 
                    questionType: 'multiple-choice', 
                    marks: 1, 
                    options: ['', '', '', ''], 
                    correctAnswer: '',
                    explanation: ''
                }]
            });
        }
    }, [isOpen, isEmbedded, assessmentId]);

    const loadAssessment = async () => {
        setIsLoading(true);
        try {
            const res = await getAssessmentById(assessmentId);
            if (res.success) {
                const data = res.data;
                reset({
                    title: data.title || '',
                    description: data.description || '',
                    assessmentType: data.assessmentType || 'quiz',
                    totalMarks: data.totalMarks || 0,
                    passingMarks: data.passingMarks || 0,
                    duration: data.duration || 30,
                    durationUnit: 'min', // Default assumption
                    attemptsAllowed: data.attempts || 3,
                    credits: data.credits || 5, // Assuming backend supports it or we just hold state
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
        setIsLoading(true);
        // Convert duration if needed or just save number. User asked for UI options.
        // We'll save the number as is, assuming user inputs duration value appropriate for the unit, 
        // OR normalize to minutes. Let's normalize to minutes for backend consistency if 'hr' is selected.
        let finalDuration = Number(data.duration);
        if (data.durationUnit === 'hr') finalDuration = finalDuration * 60;

        const payload = {
            ...data,
            moduleId,
            courseId,
            duration: finalDuration,
            attempts: Number(data.attemptsAllowed),
            credits: Number(data.credits),
            questions: data.questions.map((q, idx) => ({
                ...q,
                questionNumber: idx + 1,
                marks: Number(q.marks)
            }))
        };
        
        try {
            if (assessmentId) {
                await updateAssessment(assessmentId, payload);
                toast.success("Assessment updated successfully");
            } else {
                await createAssessment(moduleId, payload);
                toast.success("Assessment created successfully");
            }
            
            // Success: Reset form and close builder (which refreshes parent list)
            reset(); 
            onClose();

        } catch (error) {
            console.error("Save Assessment Error:", error);
            const errMsg = error.response?.data?.error || error.response?.data?.message || "Failed to save assessment";
            toast.error(typeof errMsg === 'object' ? JSON.stringify(errMsg) : errMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const onDragEnd = (result) => {
        if (!result.destination) return;
        move(result.source.index, result.destination.index);
    };

    if (!isOpen && !isEmbedded) return null;

    const containerClass = isEmbedded 
        ? "relative w-full h-[800px] flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mt-4" 
        : "fixed inset-0 z-[60] bg-gray-100 flex flex-col";

    return (
        <div className={containerClass}>
            {/* Header / Config Area */}
            <div className="bg-white border-b px-8 py-6 flex-shrink-0 z-20 shadow-sm">
                <div className="flex flex-col md:flex-row gap-6 mb-6">
                    {/* Left: Title & Description */}
                    <div className="flex-1 space-y-4">
                         <div>
                            <input 
                                {...register('title', { required: true })} 
                                className="w-full text-2xl font-bold  text-gray-800 placeholder:text-gray-300 border-b border-gray-400 focus:ring-0 px-0 bg-transparent" 
                                placeholder="Enter Assessment Title"
                            />
                            {errors.title && <span className="text-red-500 text-xs">Title is required</span>}
                        </div>
                        <div>
                             <textarea 
                                {...register('description')} 
                                rows={2}
                                className="w-full text-sm text-gray-600 placeholder:text-gray-400 border-b border-gray-400 focus:ring-0 px-0 h-32 bg-transparent resize-none" 
                                placeholder="Add a description for this assessment..."
                            />
                        </div>
                    </div>

                    {/* Right: Stats & Settings */}
                    <div className="flex-shrink-0 w-full md:w-48 bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                        <div className="flex justify-between items-center text-sm">
                             <span className="font-semibold text-gray-600 uppercase text-[10px] tracking-wider">Max Attempt</span>
                             <input 
                                type="number" 
                                {...register('attemptsAllowed')} 
                                className="w-12 text-right font-bold text-gray-800 bg-transparent border-b border-dashed border-gray-300 focus:border-blue-500 outline-none p-0"
                             />
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                             <span className="font-semibold text-gray-600 uppercase text-[10px] tracking-wider">Total Marks</span>
                             <span className="font-bold text-blue-600 text-sm">{calculatedTotalMarks}</span>
                        </div>
                         <div className="flex justify-between items-center text-[10px]">
                             <span className="font-semibold text-gray-600 uppercase text-[10px] tracking-wider">Total Credits</span>
                             <span className="font-bold text-purple-600 text-sm">{watch('credits') || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Second Row: Duration & Credits Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-6">
                    <div>
                         <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Duration</label>
                         <div className="flex">
                             <input 
                                type="number" 
                                {...register('duration')}
                                className="flex-1 px-4 py-2 border border-r-0 rounded-l-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="30"
                             />
                             <select 
                                {...register('durationUnit')}
                                className="px-4 py-2 border rounded-r-lg bg-gray-50 font-medium text-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                             >
                                 <option value="min">Min</option>
                                 <option value="hr">Hr</option>
                             </select>
                         </div>
                    </div>
                    <div>
                         <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Total Credits</label>
                         <input 
                            type="number"
                            {...register('credits')}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="5"
                         />
                    </div>
                </div>
            </div>

            {/* Scrollable Questions Area */}
            <div className="flex-1 overflow-y-auto bg-gray-100 p-8">
                 <div className="max-w-4xl mx-auto space-y-6">
                    <div className="flex justify-between items-end pb-2">
                        <h3 className="text-lg font-bold text-gray-800">Questions</h3>
                    </div>

                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="questions">
                            {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                                    {fields.map((field, index) => (
                                        <Draggable key={field.id} draggableId={field.id} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className={`bg-white rounded-xl border p-6 transition-shadow ${snapshot.isDragging ? 'shadow-xl ring-2 ring-blue-500/50' : 'shadow-sm'}`}
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <div {...provided.dragHandleProps} className="mt-3 text-gray-300 hover:text-gray-600 cursor-grab active:cursor-grabbing p-1">
                                                            <GripVertical className="w-5 h-5" />
                                                        </div>
                                                        <span className="mt-3 font-mono text-gray-400 font-bold text-lg select-none">
                                                            {String(index + 1).padStart(2, '0')}
                                                        </span>

                                                        <div className="flex-1 space-y-4">
                                                            {/* Question Header Row */}
                                                            <div className="flex flex-col md:flex-row gap-4 items-start">
                                                                <div className="flex-1 w-full">
                                                                    <input 
                                                                        {...register(`questions.${index}.questionText`, { required: true })}
                                                                        placeholder="Enter question text here..."
                                                                        className="w-full text-lg font-medium border-none focus:ring-0 p-0 placeholder:text-gray-300"
                                                                    />
                                                                    <div className="h-px bg-gray-100 mt-2 w-full" />
                                                                    {errors.questions?.[index]?.questionText && <span className="text-red-500 text-xs">Required</span>}
                                                                </div>
                                                                
                                                                <div className="flex gap-2 w-full md:w-auto">
                                                                    <select 
                                                                        {...register(`questions.${index}.questionType`)}
                                                                        className="px-3 py-1.5 bg-gray-50 border rounded-lg text-sm font-medium text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 cursor-pointer"
                                                                    >
                                                                        {QUESTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                                                    </select>
                                                                    <div className="relative">
                                                                        <input 
                                                                             type="number"
                                                                             {...register(`questions.${index}.marks`)}
                                                                             className="w-20 pl-3 pr-8 py-1.5 border rounded-lg text-sm font-semibold text-right outline-none focus:ring-2 focus:ring-blue-100"
                                                                             placeholder="1"
                                                                        />
                                                                        <span className="absolute right-2 top-1.5 text-xs text-gray-400 font-medium">Pts</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Answer Input Area */}
                                                            <div className="bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                                                                {/* Multiple Choice */}
                                                                {watch(`questions.${index}.questionType`) === 'multiple-choice' && (
                                                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                        {['A', 'B', 'C', 'D'].map((label, optIdx) => (
                                                                            <div key={optIdx} className="flex items-center gap-3">
                                                                                <div 
                                                                                    onClick={() => setValue(`questions.${index}.correctAnswer`, watch(`questions.${index}.options.${optIdx}`))}
                                                                                    className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border transition ${watch(`questions.${index}.correctAnswer`) === watch(`questions.${index}.options.${optIdx}`) && watch(`questions.${index}.options.${optIdx}`) ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400'}`}
                                                                                >
                                                                                    {label}
                                                                                </div>
                                                                                <input 
                                                                                    {...register(`questions.${index}.options.${optIdx}`)}
                                                                                    className="flex-1 px-3 py-2 border rounded-lg text-sm outline-none focus:border-blue-500 bg-white"
                                                                                    placeholder={`Option ${label}`}
                                                                                />
                                                                            </div>
                                                                        ))}
                                                                     </div>
                                                                )}

                                                                {/* Fill-ups */}
                                                                 {watch(`questions.${index}.questionType`) === 'fill-ups' && (
                                                                    <div>
                                                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Correct Answer</label>
                                                                        <input 
                                                                            {...register(`questions.${index}.correctAnswer`)}
                                                                            className="w-full px-4 py-2 border rounded-lg text-sm font-medium text-gray-800 outline-none focus:border-blue-500 bg-white"
                                                                            placeholder="Type the correct answer word/phrase..."
                                                                        />
                                                                    </div>
                                                                 )}

                                                                {/* Short Answer */}
                                                                {watch(`questions.${index}.questionType`) === 'short-answer' && (
                                                                    <div>
                                                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Ideal Answer Key</label>
                                                                        <textarea 
                                                                            {...register(`questions.${index}.correctAnswer`)}
                                                                            rows={2}
                                                                            className="w-full px-4 py-2 border rounded-lg text-sm font-medium text-gray-800 outline-none focus:border-blue-500 bg-white resize-none"
                                                                            placeholder="Keywords or ideal answer for grading..."
                                                                        />
                                                                    </div>
                                                                )}

                                                                {/* Essay */}
                                                                {watch(`questions.${index}.questionType`) === 'essay' && (
                                                                    <div>
                                                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Grading Criteria / Notes</label>
                                                                        <textarea 
                                                                            {...register(`questions.${index}.correctAnswer`)}
                                                                            rows={5}
                                                                            className="w-full px-4 py-2 border rounded-lg text-sm font-medium text-gray-800 outline-none focus:border-blue-500 bg-white resize-none"
                                                                            placeholder="Enter instructions for grading this essay..."
                                                                        />
                                                                    </div>
                                                                )}
                                                                
                                                                {/* True/False */}
                                                                {watch(`questions.${index}.questionType`) === 'true-false' && (
                                                                     <div className="flex gap-4 max-w-sm">
                                                                         {['True', 'False'].map((val) => (
                                                                             <label key={val} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition ${watch(`questions.${index}.correctAnswer`) === val ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold' : 'bg-white hover:bg-gray-50'}`}>
                                                                                 <input type="radio" value={val} {...register(`questions.${index}.correctAnswer`)} className="hidden" />
                                                                                 {val}
                                                                             </label>
                                                                         ))}
                                                                     </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <button type="button" onClick={() => remove(index)} className="mt-3 text-gray-300 hover:text-red-500 p-1.5 hover:bg-red-50 rounded transition" title="Delete">
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
                        type="button"
                        onClick={() => append({ 
                            questionNumber: fields.length + 1, 
                            questionText: '', 
                            questionType: 'multiple-choice', 
                            marks: 1, 
                            options: ['', '', '', ''], 
                            correctAnswer: '', 
                            explanation: '' 
                        })}
                        className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition flex items-center justify-center gap-2 font-semibold"
                    >
                        <Plus className="w-5 h-5" /> Add New Question
                    </button>
                 </div>
            </div>

            {/* Footer Action Bar */}
            <div className="bg-white border-t px-8 py-4 flex justify-end gap-3 z-30">
                 {!isEmbedded && (
                    <button type="button" onClick={onClose} className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition">
                        Cancel
                    </button>
                 )}
                 <button 
                    type="button"
                    onClick={handleSubmit(onSubmit)} 
                    disabled={isLoading}
                    className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-lg hover:shadow-xl active:scale-95 transition flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                 >
                     {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                        </>
                     ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" /> Save Assessment
                        </>
                     )}
                 </button>
            </div>
        </div>
    );
};

export default AssessmentBuilder;
