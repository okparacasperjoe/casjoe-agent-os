import React, { useState } from 'react';
import { 
  CheckSquare, Plus, Search, Calendar, User, AlertCircle, 
  Trash2, ArrowRight, ArrowLeft, CheckCircle2, Clock, Filter, Layers 
} from 'lucide-react';
import { useTasks, useProjects, updateTaskStatus, deleteTask } from '../db/hooks';

export default function TaskView({ onOpenAddTask }) {
  const tasks = useTasks() || [];
  const projects = useProjects() || [];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');

  const columns = [
    { id: 'To Do', title: 'To Do', color: 'border-slate-500/30', headerBg: 'bg-slate-800/40 text-slate-300' },
    { id: 'In Progress', title: 'In Progress', color: 'border-amber-500/30', headerBg: 'bg-amber-500/10 text-amber-400' },
    { id: 'Under Review', title: 'Under Review', color: 'border-blue-500/30', headerBg: 'bg-blue-500/10 text-blue-400' },
    { id: 'Completed', title: 'Completed', color: 'border-emerald-500/30', headerBg: 'bg-emerald-500/10 text-emerald-400' },
  ];

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = (task.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (task.assignedTo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (task.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = selectedProjectId === 'All' || String(task.projectId) === String(selectedProjectId);
    const matchesPriority = selectedPriority === 'All' || task.priority === selectedPriority;
    return matchesSearch && matchesProject && matchesPriority;
  });

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Low':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getNextStatus = (currentStatus) => {
    const order = ['To Do', 'In Progress', 'Under Review', 'Completed'];
    const idx = order.indexOf(currentStatus);
    return idx < order.length - 1 ? order[idx + 1] : null;
  };

  const getPrevStatus = (currentStatus) => {
    const order = ['To Do', 'In Progress', 'Under Review', 'Completed'];
    const idx = order.indexOf(currentStatus);
    return idx > 0 ? order[idx - 1] : null;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 font-['Outfit']">
            <CheckSquare className="w-6 h-6 text-[#FF9F00]" />
            Action Tasks & Kanban Board
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Offline agile task board for operational execution, team assignees, and deadlines.
          </p>
        </div>
        <button
          onClick={onOpenAddTask}
          className="btn-primary text-xs flex items-center gap-2 py-2.5 px-4"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Task Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {columns.map(col => {
          const count = tasks.filter(t => t.status === col.id).length;
          return (
            <div key={col.id} className="bg-[#070B15] border border-white/10 p-3.5 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">{col.title}</div>
                <div className="text-xl font-bold text-white font-['Outfit'] mt-0.5">{count}</div>
              </div>
              <span className={`w-3 h-3 rounded-full ${col.id === 'Completed' ? 'bg-emerald-400' : col.id === 'In Progress' ? 'bg-amber-400' : col.id === 'Under Review' ? 'bg-blue-400' : 'bg-slate-500'}`} />
            </div>
          );
        })}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks by title, description, assignee..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="custom-input pl-10 w-full text-xs"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="custom-select text-xs py-2 px-3"
          >
            <option value="All">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="custom-select text-xs py-2 px-3"
          >
            <option value="All">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {columns.map(column => {
          const colTasks = filteredTasks.filter(t => (t.status || 'To Do') === column.id);

          return (
            <div
              key={column.id}
              className={`bg-[#070B15]/90 border ${column.color} rounded-2xl p-4 flex flex-col space-y-3 min-h-[500px] shadow-lg`}
            >
              {/* Column Header */}
              <div className={`flex items-center justify-between px-3 py-2 rounded-xl ${column.headerBg}`}>
                <span className="text-xs font-bold font-['Outfit'] uppercase tracking-wider">
                  {column.title}
                </span>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-black/30">
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks in Column */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] pr-0.5">
                {colTasks.length === 0 ? (
                  <div className="border border-dashed border-white/5 rounded-xl p-8 text-center text-slate-600 text-xs">
                    No tasks in {column.title}
                  </div>
                ) : (
                  colTasks.map(task => {
                    const linkedProject = projects.find(p => String(p.id) === String(task.projectId));
                    const nextSt = getNextStatus(task.status);
                    const prevSt = getPrevStatus(task.status);

                    return (
                      <div
                        key={task.id}
                        className="bg-[#0C1222] border border-white/10 hover:border-amber-500/40 transition rounded-xl p-3.5 space-y-2.5 group shadow-md"
                      >
                        {/* Task Top Badges */}
                        <div className="flex items-center justify-between gap-1.5">
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getPriorityBadge(task.priority)}`}>
                            {task.priority || 'Normal'}
                          </span>
                          <button
                            onClick={() => {
                              if (confirm(`Delete task "${task.title}"?`)) {
                                deleteTask(task.id);
                              }
                            }}
                            className="text-slate-500 hover:text-rose-400 transition p-0.5"
                            title="Delete Task"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Title & Description */}
                        <h4 className="text-xs font-bold text-white leading-snug">
                          {task.title}
                        </h4>

                        {task.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        {/* Project Tag */}
                        {linkedProject && (
                          <div className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10 w-fit">
                            <Layers className="w-3 h-3" />
                            <span className="truncate max-w-[150px]">{linkedProject.name}</span>
                          </div>
                        )}

                        {/* Assignee & Due Date */}
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
                          <div className="flex items-center gap-1 truncate max-w-[120px]" title={task.assignedTo}>
                            <User className="w-3 h-3 text-slate-400" />
                            <span className="truncate">{task.assignedTo || 'Unassigned'}</span>
                          </div>
                          {task.dueDate && (
                            <div className="flex items-center gap-1 font-mono text-[10px] text-slate-300">
                              <Calendar className="w-3 h-3 text-blue-400" />
                              <span>{task.dueDate}</span>
                            </div>
                          )}
                        </div>

                        {/* Move Columns Controls */}
                        <div className="flex items-center justify-between pt-1 border-t border-white/5 gap-1">
                          {prevSt ? (
                            <button
                              onClick={() => updateTaskStatus(task.id, prevSt)}
                              className="text-[10px] flex items-center gap-1 text-slate-400 hover:text-white px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition"
                              title={`Move to ${prevSt}`}
                            >
                              <ArrowLeft className="w-3 h-3" />
                              <span>Back</span>
                            </button>
                          ) : <div />}

                          {nextSt ? (
                            <button
                              onClick={() => updateTaskStatus(task.id, nextSt)}
                              className="text-[10px] flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 transition"
                              title={`Advance to ${nextSt}`}
                            >
                              <span>Next</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Done
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
