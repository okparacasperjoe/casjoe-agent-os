import React, { useState } from 'react';
import { 
  FolderKanban, Plus, Search, Calendar, DollarSign, CheckCircle2, 
  Clock, AlertCircle, Trash2, Building2, TrendingUp, Filter 
} from 'lucide-react';
import { useProjects, useTasks, updateProject, deleteProject } from '../db/hooks';

export default function ProjectView({ onOpenAddProject }) {
  const projects = useProjects() || [];
  const tasks = useTasks() || [];
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [editingProgressId, setEditingProgressId] = useState(null);
  const [tempProgress, setTempProgress] = useState(0);

  // Filtered list
  const filteredProjects = projects.filter(p => {
    const matchesSearch = (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.client || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Project Metrics
  const totalProjects = projects.length;
  const inProgressCount = projects.filter(p => p.status === 'In Progress').length;
  const completedCount = projects.filter(p => p.status === 'Completed').length;
  const totalBudget = projects.reduce((sum, p) => sum + (parseFloat(p.budget) || 0), 0);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'In Progress':
        return 'bg-amber-500/10 text-[#FF9F00] border-amber-500/20';
      case 'On Hold':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    const updatePayload = { status: newStatus };
    if (newStatus === 'Completed') {
      updatePayload.progress = 100;
    }
    await updateProject(id, updatePayload);
  };

  const handleSaveProgress = async (id) => {
    await updateProject(id, { progress: Math.min(100, Math.max(0, parseInt(tempProgress, 10) || 0)) });
    setEditingProgressId(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 font-['Outfit']">
            <FolderKanban className="w-6 h-6 text-[#FF9F00]" />
            Projects & Milestones
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Manage enterprise offline client projects, deliverables, milestones, and budgets.
          </p>
        </div>
        <button
          onClick={onOpenAddProject}
          className="btn-primary text-xs flex items-center gap-2 py-2.5 px-4"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#070B15] border border-white/10 p-5 rounded-2xl">
          <div className="flex justify-between items-start mb-2">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Projects</span>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold text-white font-['Outfit']">{totalProjects}</span>
        </div>

        <div className="bg-[#070B15] border border-white/10 p-5 rounded-2xl">
          <div className="flex justify-between items-start mb-2">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">In Progress</span>
            <div className="p-2 bg-amber-500/10 rounded-lg text-[#FF9F00]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold text-[#FF9F00] font-['Outfit']">{inProgressCount}</span>
        </div>

        <div className="bg-[#070B15] border border-white/10 p-5 rounded-2xl">
          <div className="flex justify-between items-start mb-2">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Completed</span>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold text-emerald-400 font-['Outfit']">{completedCount}</span>
        </div>

        <div className="bg-[#070B15] border border-white/10 p-5 rounded-2xl">
          <div className="flex justify-between items-start mb-2">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Committed Budget</span>
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold text-white font-['Outfit']">
            ₦{(totalBudget || 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects by name, client, or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="custom-input pl-10 w-full text-xs"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="custom-select text-xs py-2 px-3"
          >
            <option value="All">All Statuses</option>
            <option value="Planning">Planning</option>
            <option value="In Progress">In Progress</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-[#070B15] border border-white/10 rounded-2xl p-12 text-center space-y-3">
          <FolderKanban className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="text-slate-400 text-sm">No projects found matching the criteria.</p>
          <button
            onClick={onOpenAddProject}
            className="btn-primary text-xs py-2 px-4 mx-auto"
          >
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => {
            const projectTasks = tasks.filter(t => String(t.projectId) === String(project.id));
            const completedTasks = projectTasks.filter(t => t.status === 'Completed').length;
            const progressVal = project.progress || 0;

            return (
              <div
                key={project.id}
                className="bg-[#070B15] border border-white/10 hover:border-amber-500/40 transition-all duration-150 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg"
              >
                {/* Card Top */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getStatusBadge(project.status)}`}>
                      {project.status}
                    </span>
                    <button
                      onClick={() => {
                        if (confirm(`Delete project "${project.name}"?`)) {
                          deleteProject(project.id);
                        }
                      }}
                      className="text-slate-500 hover:text-rose-400 transition p-1"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-white leading-tight font-['Outfit']">
                    {project.name}
                  </h3>

                  {project.client && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{project.client}</span>
                    </div>
                  )}

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {project.description || 'No description provided.'}
                  </p>
                </div>

                {/* Progress Bar & Quick Adjust */}
                <div className="space-y-1.5 pt-2 border-t border-white/5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Progress</span>
                    {editingProgressId === project.id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={tempProgress}
                          onChange={(e) => setTempProgress(e.target.value)}
                          className="w-14 bg-slate-900 text-white text-xs px-1.5 py-0.5 rounded border border-amber-500 text-center"
                        />
                        <button
                          onClick={() => handleSaveProgress(project.id)}
                          className="text-[10px] bg-amber-500 text-black font-bold px-1.5 py-0.5 rounded hover:bg-amber-400"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <span
                        onClick={() => {
                          setEditingProgressId(project.id);
                          setTempProgress(progressVal);
                        }}
                        className="text-white font-bold cursor-pointer hover:text-amber-400"
                        title="Click to edit progress"
                      >
                        {progressVal}%
                      </span>
                    )}
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300 rounded-full"
                      style={{ width: `${progressVal}%` }}
                    />
                  </div>
                </div>

                {/* Card Footer Details */}
                <div className="space-y-2 pt-2 border-t border-white/5 text-xs text-slate-400">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      Budget:
                    </span>
                    <span className="text-white font-semibold font-mono">
                      {project.currency || 'NGN'} {(project.budget ? Number(project.budget).toLocaleString() : '0')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-400" />
                      Deadline:
                    </span>
                    <span className="text-slate-300 font-mono">
                      {project.endDate || 'No deadline'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Linked Tasks:</span>
                    <span className="text-amber-400 font-semibold font-mono">
                      {completedTasks} / {projectTasks.length} Done
                    </span>
                  </div>

                  {/* Status Toggle Dropdown */}
                  <div className="pt-2">
                    <select
                      value={project.status}
                      onChange={(e) => handleStatusChange(project.id, e.target.value)}
                      className="w-full bg-[#0E1528] border border-white/10 rounded-lg text-slate-300 text-xs py-1.5 px-2 font-medium"
                    >
                      <option value="Planning">Mark as: Planning</option>
                      <option value="In Progress">Mark as: In Progress</option>
                      <option value="On Hold">Mark as: On Hold</option>
                      <option value="Completed">Mark as: Completed</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
