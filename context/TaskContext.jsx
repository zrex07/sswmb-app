import React, { createContext, useEffect, useState } from "react";
import tasksData from "../assets/data/tasks.json";

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [reviewedTasks, setReviewedTasks] = useState([]);

  useEffect(() => {
    // Load initial tasks
    setTasks(tasksData);
  }, []);

  //  Get all pending tasks or by category
  const getPending = (category = null) => {
    const filtered = tasks.filter((t) => !t.complete);
    return category ? filtered.filter((t) => t.category === category) : filtered;
  };

  //  Get reviewed tasks (sorted by latest)
  const getReviewed = (category = null) => {
    let filtered = reviewedTasks;
    if (category) filtered = filtered.filter((t) => t.category === category);

    // Sort newest reviewed first
    return filtered.sort(
      (a, b) => new Date(b.reviewed_at) - new Date(a.reviewed_at)
    );
  };

  //  Get counts for dashboard & category cards
  const getCountsForCategory = (category) => {
    const total = tasksData.filter((t) => t.category === category).length;
    const reviewed = reviewedTasks.filter((t) => t.category === category).length;
    const pending = tasks.filter((t) => t.category === category && !t.complete).length;
    const progress = total > 0 ? reviewed / total : 0;
    return { total, reviewed, pending, progress };
  };

  //  Submit or mark a task as reviewed
  const submitTask = (taskId, comment) => {
    const taskToReview = tasks.find((t) => t.id === taskId);
    if (!taskToReview) return { error: "Task not found" };

    const reviewedTask = {
      ...taskToReview,
      complete: true,
      comment,
      reviewed_at: new Date().toISOString(),
    };

    // Add to top of reviewed tasks (not bottom)
    setReviewedTasks((prev) => [reviewedTask, ...prev]);

    // Remove from pending list
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    return { success: true };
  };

  // Get unique categories in fixed order
  const getCategories = () => {
    const categories = [...new Set(tasksData.map(task => task.category))];
    // Define a fixed order for categories
    const categoryOrder = [
      "Mannual Sweeping",
      "Door To Door", 
      "Garbage Collection",
      "Mechanical Sweeping",
      "Water Sprinkling",
      "Emergency Task"
    ];
    
    return categories.sort((a, b) => {
      const indexA = categoryOrder.indexOf(a);
      const indexB = categoryOrder.indexOf(b);
      return indexA - indexB;
    });
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        reviewedTasks,
        getPending,
        getReviewed,
        getCountsForCategory,
        submitTask,
        getCategories, // Add this new function
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};