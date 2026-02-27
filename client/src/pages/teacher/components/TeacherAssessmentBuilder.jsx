import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { X, Save, Plus, Trash2, GripVertical, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import {
  createAssessment,
  updateAssessment,
  getAssessmentById,
} from "../../../services/assessmentService";

const QUESTION_TYPES = [
  { value: "multiple-choice", label: "Multiple Choice" },
  { value: "true-false", label: "True / False" },
  { value: "fill-ups", label: "Fill in the Blanks" },
  { value: "short-answer", label: "Short Answer" },
  { value: "essay", label: "Essay" },
];

const TeacherAssessmentBuilder = ({
  isOpen,
  onClose,
  moduleId,
  courseId,
  assessmentId,
  isEmbedded = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      assessmentType: "quiz",
      totalMarks: 0,
      passingMarks: 0,
      duration: 30,
      durationUnit: "min",
      attemptsAllowed: 3,
      credits: 5,
      showCorrectAnswers: true,
      randomizeQuestions: false,
      isActive: true,
      questions: [],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "questions",
  });

  const questions = watch("questions");
  const calculatedTotalMarks =
    questions?.reduce((sum, q) => sum + (Number(q.marks) || 0), 0) || 0;

  useEffect(() => {
    setValue("totalMarks", calculatedTotalMarks);
  }, [calculatedTotalMarks, setValue]);

  useEffect(() => {
    if ((isOpen || isEmbedded) && assessmentId) {
      loadAssessment();
    } else if (isOpen || isEmbedded) {
      reset({
        title: "",
        description: "",
        assessmentType: "quiz",
        totalMarks: 0,
        passingMarks: 0,
        duration: 30,
        durationUnit: "min",
        attemptsAllowed: 3,
        credits: 5,
        showCorrectAnswers: true,
        randomizeQuestions: false,
        isActive: true,
        questions: [
          {
            questionNumber: 1,
            questionText: "",
            questionType: "multiple-choice",
            marks: 1,
            options: ["", "", "", ""],
            correctAnswer: "",
            explanation: "",
          },
        ],
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
          title: data.title || "",
          description: data.description || "",
          assessmentType: data.assessmentType || "quiz",
          totalMarks: data.totalMarks || 0,
          passingMarks: data.passingMarks || 0,
          duration: data.duration || 30,
          durationUnit: "min",
          attemptsAllowed: data.attempts || 3,
          credits: data.credits || 5,
          showCorrectAnswers: data.showCorrectAnswers ?? true,
          randomizeQuestions: data.randomizeQuestions ?? false,
          isActive: data.isActive ?? true,
          questions: data.questions || [],
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
    let finalDuration = Number(data.duration);
    if (data.durationUnit === "hr") finalDuration = finalDuration * 60;

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
        marks: Number(q.marks),
      })),
    };

    try {
      if (assessmentId) {
        await updateAssessment(assessmentId, payload);
        toast.success("Assessment updated successfully");
      } else {
        await createAssessment(moduleId, payload);
        toast.success("Assessment created successfully");
      }

      reset();
      onClose();
    } catch (error) {
      console.error("Save Assessment Error:", error);
      const errMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to save assessment";
      toast.error(typeof errMsg === "object" ? JSON.stringify(errMsg) : errMsg);
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
    ? "relative w-full h-[800px] flex flex-col bg-white border border-gray-100 rounded-md shadow-sm overflow-hidden mt-4"
    : "fixed inset-0 z-[60] bg-gray-50/50 flex flex-col";

  return (
    <div className={containerClass}>
      {/* Header / Config Area */}
      <div className="bg-white border-b border-gray-100 px-8 py-8 flex-shrink-0 z-20 shadow-sm text-center sm:text-left">
        <div className="flex flex-col lg:flex-row gap-10 mb-8">
          {/* Left: Title & Description */}
          <div className="flex-1 space-y-6">
            <div>
              <input
                {...register("title", { required: true })}
                className="w-full text-2xl text-gray-900 placeholder:text-gray-300 border-b border-gray-100 focus:ring-0 px-0 bg-transparent capitalize focus:border-[#c72323] transition-colors"
                placeholder="Enter Assessment Title"
              />
              {errors.title && (
                <span className="text-[#c72323] text-[11px] mt-1 block capitalize">
                  Title is required
                </span>
              )}
            </div>
            <div>
              <textarea
                {...register("description")}
                rows={2}
                className="w-full text-[14px] text-gray-600 placeholder:text-gray-400 border-b border-gray-100 focus:ring-0 px-0 h-24 bg-transparent resize-none focus:border-[#c72323] transition-colors leading-relaxed"
                placeholder="Add a description for this assessment..."
              />
            </div>
          </div>

          {/* Right: Stats & Settings */}
          <div className="flex-shrink-0 w-full lg:w-56 bg-white rounded-md p-6 border border-gray-100 space-y-5 shadow-sm">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-gray-600 capitalize">Max Attempts</span>
              <input
                type="number"
                {...register("attemptsAllowed")}
                className="w-12 text-right text-gray-900 bg-transparent border-b border-dashed border-gray-200 focus:border-[#c72323] outline-none p-0"
              />
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-gray-600 capitalize">Total Marks</span>
              <span className="text-sm" style={{ color: "#c72323" }}>
                {calculatedTotalMarks}
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-gray-600 capitalize">Total Credits</span>
              <span className="text-emerald-600 text-sm">
                {watch("credits") || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Second Row: Duration & Credits Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-gray-50 pt-8">
          <div>
            <label className="block text-[12px] text-gray-600 mb-3 capitalize">
              Duration
            </label>
            <div className="flex">
              <input
                type="number"
                {...register("duration")}
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 border-r-0 rounded-l-md focus:ring-1 focus:ring-[#c72323] outline-none text-sm text-gray-900"
                placeholder="30"
              />
              <select
                {...register("durationUnit")}
                className="px-4 py-3 bg-gray-100 border border-gray-100 rounded-r-md text-sm text-gray-600 outline-none capitalize"
              >
                <option value="min">Min</option>
                <option value="hr">Hr</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[12px] text-gray-600 mb-3 capitalize">
              Total Credits
            </label>
            <input
              type="number"
              {...register("credits")}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-md focus:ring-1 focus:ring-[#c72323] outline-none text-sm text-gray-900"
              placeholder="5"
            />
          </div>
        </div>
      </div>

      {/* Scrollable Questions Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50/50 p-8">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="flex justify-between items-end border-b border-gray-100 pb-4">
            <h3 className="text-lg text-gray-900 capitalize">
              Assessment <span className="text-gray-400">Inventory</span>
            </h3>
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="questions">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-6"
                >
                  {fields.map((field, index) => (
                    <Draggable
                      key={field.id}
                      draggableId={field.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`bg-white rounded-md border p-8 transition-shadow ${snapshot.isDragging ? "shadow-xl ring-1 ring-[#c72323]/30" : "shadow-sm border-gray-100"}`}
                        >
                          <div className="flex items-start gap-4">
                            <div
                              {...provided.dragHandleProps}
                              className="mt-2 text-gray-300 hover:text-[#c72323] cursor-grab active:cursor-grabbing p-1 transition-colors"
                            >
                              <GripVertical className="w-5 h-5" />
                            </div>
                            <span className="mt-2 text-gray-300 text-lg select-none">
                              {String(index + 1).padStart(2, "0")}
                            </span>

                            <div className="flex-1 space-y-6 text-center sm:text-left">
                              {/* Question Header Row */}
                              <div className="flex flex-col lg:flex-row gap-6 items-start">
                                <div className="flex-1 w-full">
                                  <input
                                    {...register(
                                      `questions.${index}.questionText`,
                                      { required: true },
                                    )}
                                    placeholder="Enter question text here..."
                                    className="w-full text-lg text-gray-900 border-none focus:ring-0 p-0 placeholder:text-gray-300 capitalize"
                                  />
                                  <div className="h-px bg-gray-50 mt-2 w-full" />
                                  {errors.questions?.[index]?.questionText && (
                                    <span className="text-[#c72323] text-[11px] mt-1 block capitalize">
                                      Question text required
                                    </span>
                                  )}
                                </div>

                                <div className="flex gap-3 w-full lg:w-auto mt-2 lg:mt-0 justify-center">
                                  <select
                                    {...register(
                                      `questions.${index}.questionType`,
                                    )}
                                    className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-md text-[13px] text-gray-700 outline-none focus:bg-white focus:ring-1 focus:ring-[#c72323] cursor-pointer capitalize transition-all"
                                  >
                                    {QUESTION_TYPES.map((t) => (
                                      <option key={t.value} value={t.value}>
                                        {t.label}
                                      </option>
                                    ))}
                                  </select>
                                  <div className="relative">
                                    <input
                                      type="number"
                                      {...register(`questions.${index}.marks`)}
                                      className="w-24 pl-3 pr-10 py-2 border border-gray-100 rounded-md text-[13px] text-right outline-none focus:ring-1 focus:ring-[#c72323] text-gray-900"
                                      placeholder="1"
                                    />
                                    <span className="absolute right-3 top-2.5 text-[11px] text-gray-400 capitalize">
                                      Pts
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Answer Input Area */}
                              <div className="bg-gray-50/30 p-6 rounded-md border border-gray-100">
                                {/* Multiple Choice */}
                                {watch(`questions.${index}.questionType`) ===
                                  "multiple-choice" && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {["A", "B", "C", "D"].map(
                                      (label, optIdx) => (
                                        <div
                                          key={optIdx}
                                          className="flex items-center gap-4"
                                        >
                                          <div
                                            onClick={() =>
                                              setValue(
                                                `questions.${index}.correctAnswer`,
                                                watch(
                                                  `questions.${index}.options.${optIdx}`,
                                                ),
                                              )
                                            }
                                            className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border text-[11px] transition-all ${watch(`questions.${index}.correctAnswer`) === watch(`questions.${index}.options.${optIdx}`) && watch(`questions.${index}.options.${optIdx}`) ? "bg-emerald-500 border-emerald-500 text-white shadow-sm" : "bg-white border-gray-100 text-gray-400 hover:border-[#c72323]"}`}
                                          >
                                            {label}
                                          </div>
                                          <input
                                            {...register(
                                              `questions.${index}.options.${optIdx}`,
                                            )}
                                            className="flex-1 px-4 py-2.5 bg-white border border-gray-100 rounded-md text-sm outline-none focus:ring-1 focus:ring-[#c72323] transition-all"
                                            placeholder={`Option ${label}`}
                                          />
                                        </div>
                                      ),
                                    )}
                                  </div>
                                )}

                                {/* Fill-ups */}
                                {watch(`questions.${index}.questionType`) ===
                                  "fill-ups" && (
                                  <div className="space-y-3">
                                    <label className="block text-[11px] text-gray-500 capitalize">
                                      Validation Terminal
                                    </label>
                                    <input
                                      {...register(
                                        `questions.${index}.correctAnswer`,
                                      )}
                                      className="w-full px-4 py-3 bg-white border border-gray-100 rounded-md text-sm text-gray-900 outline-none focus:ring-1 focus:ring-[#c72323] capitalize"
                                      placeholder="Define operational keyword/phrase..."
                                    />
                                  </div>
                                )}

                                {/* Short Answer */}
                                {watch(`questions.${index}.questionType`) ===
                                  "short-answer" && (
                                  <div className="space-y-3">
                                    <label className="block text-[11px] text-gray-500 capitalize">
                                      Reference Schema
                                    </label>
                                    <textarea
                                      {...register(
                                        `questions.${index}.correctAnswer`,
                                      )}
                                      rows={3}
                                      className="w-full px-4 py-3 bg-white border border-gray-100 rounded-md text-sm text-gray-900 outline-none focus:ring-1 focus:ring-[#c72323] resize-none leading-relaxed"
                                      placeholder="Key performance indicators for grading..."
                                    />
                                  </div>
                                )}

                                {/* Essay */}
                                {watch(`questions.${index}.questionType`) ===
                                  "essay" && (
                                  <div className="space-y-3">
                                    <label className="block text-[11px] text-gray-500 capitalize">
                                      Evaluation Protocol
                                    </label>
                                    <textarea
                                      {...register(
                                        `questions.${index}.correctAnswer`,
                                      )}
                                      rows={6}
                                      className="w-full px-4 py-3 bg-white border border-gray-100 rounded-md text-sm text-gray-900 outline-none focus:ring-1 focus:ring-[#c72323] resize-none leading-relaxed"
                                      placeholder="Detailed rubric for analytical assessment..."
                                    />
                                  </div>
                                )}

                                {/* True/False */}
                                {watch(`questions.${index}.questionType`) ===
                                  "true-false" && (
                                  <div className="flex gap-6 max-w-sm justify-center sm:justify-start">
                                    {["True", "False"].map((val) => (
                                      <label
                                        key={val}
                                        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-md border cursor-pointer transition-all text-[13px] capitalize ${watch(`questions.${index}.correctAnswer`) === val ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm" : "bg-white border-gray-100 hover:border-[#c72323] text-gray-500"}`}
                                      >
                                        <input
                                          type="radio"
                                          value={val}
                                          {...register(
                                            `questions.${index}.correctAnswer`,
                                          )}
                                          className="hidden"
                                        />
                                        {val}
                                      </label>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="mt-2 text-gray-200 hover:text-[#c72323] p-2 hover:bg-red-50 rounded-md transition-all"
                              title="Delete"
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
            type="button"
            onClick={() =>
              append({
                questionNumber: fields.length + 1,
                questionText: "",
                questionType: "multiple-choice",
                marks: 1,
                options: ["", "", "", ""],
                correctAnswer: "",
                explanation: "",
              })
            }
            className="w-full py-6 border-2 border-dashed border-gray-100 rounded-md text-gray-400 hover:border-[#c72323]/50 hover:text-[#c72323] hover:bg-red-50/30 transition-all flex items-center justify-center gap-3 text-[14px] capitalize"
          >
            <Plus className="w-5 h-5" /> Initialize New Data Point
          </button>
        </div>
      </div>

      {/* Footer Action Bar */}
      <div className="bg-white border-t border-gray-100 px-8 py-6 flex justify-end gap-4 z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {!isEmbedded && (
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-gray-500 hover:text-gray-900 text-[13px] capitalize transition-colors"
          >
            Cancel Operation
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit(onSubmit)}
          disabled={isLoading}
          className="px-10 py-2.5 bg-gray-900 text-white rounded-md hover:bg-[#c72323] text-[13px] capitalize transition-all flex items-center shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-wait"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Synchronizing...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" /> Commit Assessment
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default TeacherAssessmentBuilder;
